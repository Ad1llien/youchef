import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import nutritionRouter from "./routes/nutritionRoutes.js";
import translateRouter from "./routes/translate.js";
import recipeRequestRouter from "./routes/recipeRequestRoutes.js";
import aiRouter from "./routes/aiRoute.js";
import contactRouter from "./routes/contactRoute.js";
import { isAuthenticated } from "./controllers/authController.js";
import "./bot.js";
import adminRouter from "./routes/adminRoutes.js";
const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB
connectDB();

// ─── 1. Helmet — защита HTTP заголовков ──────────────────────────────────────
// Защищает от XSS, clickjacking, MIME sniffing и других атак
app.use(helmet({
  contentSecurityPolicy: false, // отключаем CSP чтобы не ломать React
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // ← добавь это

}));

// ─── 2. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5174",
  "https://youchef-front.onrender.com",
  "https://www.youchef.com",
  "https://www.youchef.kz",
  "https://youchef.kz",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));

// ─── 3. JSON + cookies ────────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" })); // уменьшили с 10mb до 5mb
app.use(cookieParser());

// ─── 4. Rate Limiters ─────────────────────────────────────────────────────────

// Общий лимит для всего API — 200 запросов в 15 минут с одного IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  skip: (req) => req.path.startsWith("/assets"), // не ограничиваем статику
});

// Жёсткий лимит для AI роутов — 10 запросов в минуту с одного IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please wait a minute." },
});

// Лимит для авторизации — 20 попыток в 15 минут (защита от брутфорса)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

// Лимит для контактной формы — 5 сообщений в час
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again later." },
});

app.use(globalLimiter);

// ─── 5. Логирование подозрительных запросов ──────────────────────────────────
app.use((req, res, next) => {
  const suspicious = [
    "../", "..\\",           // path traversal
    "<script", "javascript:", // XSS
    "SELECT ", "DROP ",        // SQL injection (на всякий)
    "eval(",                   // JS injection
  ];
  const url = decodeURIComponent(req.url).toLowerCase();
  const body = JSON.stringify(req.body || "").toLowerCase();

  if (suspicious.some(s => url.includes(s.toLowerCase()) || body.includes(s.toLowerCase()))) {
    console.warn(`⚠️  Suspicious request from ${req.ip}: ${req.method} ${req.url}`);
    return res.status(400).json({ success: false, message: "Bad request" });
  }
  next();
});

// ─── Статика для загруженных файлов ──────────────────────────────────────────
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.resolve("backend/uploads")));

// ─── API роуты ────────────────────────────────────────────────────────────────
app.use("/api/ai",             aiLimiter,      aiRouter);
app.use("/api/auth",           authLimiter,    authRouter);
app.use("/api/user",                           userRouter);
app.use("/api/nutrition",                      nutritionRouter);
app.use("/api/translate",                      translateRouter);
app.use("/api/recipe-request",                 recipeRequestRouter);
app.use("/api/contact",        contactLimiter, contactRouter);
app.get("/api/auth/is-auth",                   isAuthenticated);
app.use("/api/admin", adminRouter);
// ─── React фронт — ПОСЛЕ всех API роутов ─────────────────────────────────────
app.use(express.static(path.join(__dirname, "../my-react-app/dist"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".css"))  res.setHeader("Content-Type", "text/css");
    if (filePath.endsWith(".js"))   res.setHeader("Content-Type", "application/javascript");
    if (filePath.endsWith(".svg"))  res.setHeader("Content-Type", "image/svg+xml");
    if (filePath.endsWith(".png"))  res.setHeader("Content-Type", "image/png");
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
  }
}));



// SPA fallback
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-react-app/dist/index.html"));
});

// ─── Глобальный обработчик ошибок ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(port, () => console.log(`Server started on PORT:${port}`));