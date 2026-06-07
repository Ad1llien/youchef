import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
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
import { initGameSocket } from "./gameSocket.js";

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const allowedOrigins = [
  "http://localhost:5174",
  "https://youchef-front.onrender.com",
  "https://www.youchef.com",
  "https://www.youchef.kz",
  "https://youchef.kz",
].filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 1000,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  skip: (req) => req.path.startsWith("/assets"),
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please wait a minute." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please try again later." },
});

app.use(globalLimiter);

app.use((req, res, next) => {
  const suspicious = ["../", "..\\", "<script", "javascript:", "SELECT ", "DROP ", "eval("];
  const url = decodeURIComponent(req.url).toLowerCase();
  const body = JSON.stringify(req.body || "").toLowerCase();
  if (suspicious.some(s => url.includes(s.toLowerCase()) || body.includes(s.toLowerCase()))) {
    console.warn(`⚠️  Suspicious request from ${req.ip}: ${req.method} ${req.url}`);
    return res.status(400).json({ success: false, message: "Bad request" });
  }
  next();
});

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
app.use("/api/admin",                          adminRouter);

// ─── OG Helper ───────────────────────────────────────────────────────────────
const isCrawler = (req) => {
  const ua = req.headers["user-agent"] || "";
  console.log(`[OG] UA: ${ua.slice(0, 80)}`);
  return /telegrambot|whatsapp|discordbot|twitterbot|facebookexternalhit|linkedinbot|vkshare|slackbot/i.test(ua);
};

const makeOGPage = ({ title, description, image, url }) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="YouChef" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`;

// ─── OG роуты ДО статики ─────────────────────────────────────────────────────
app.get("/meal/:id", async (req, res, next) => {
  if (!isCrawler(req)) return next();
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.params.id}`
    );
    const data = await response.json();
    const meal = data.meals?.[0];
    if (!meal) return next();
    res.send(makeOGPage({
      title: `${meal.strMeal} — YouChef`,
      description: `${meal.strCategory} • ${meal.strArea} recipe. Get full ingredients and instructions on YouChef!`,
      image: meal.strMealThumb,
      url: `https://youchef.kz/meal/${req.params.id}`,
    }));
  } catch {
    return next();
  }
});

app.get("/premium", (req, res, next) => {
  if (!isCrawler(req)) return next();
  res.send(makeOGPage({
    title: "YouChef Premium ✨",
    description: "Upgrade to Premium — unlimited AI nutrition analysis, exclusive recipes and meal plans.",
    image: "https://youchef.kz/og-image.png",
    url: "https://youchef.kz/premium",
  }));
});

// ─── React статика ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../my-react-app/dist"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".css"))  res.setHeader("Content-Type", "text/css");
    if (filePath.endsWith(".js"))   res.setHeader("Content-Type", "application/javascript");
    if (filePath.endsWith(".svg"))  res.setHeader("Content-Type", "image/svg+xml");
    if (filePath.endsWith(".png"))  res.setHeader("Content-Type", "image/png");
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
  }
}));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-react-app/dist/index.html"));
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const httpServer = createServer(app);
initGameSocket(httpServer);
httpServer.listen(port, () => console.log(`Server started on PORT:${port}`));