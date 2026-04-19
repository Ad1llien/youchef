import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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

const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB
connectDB();

const allowedOrigins = [
  "http://localhost:5174",
  "https://youchef-front.onrender.com",
  "https://www.youchef.com",
  "https://www.youchef.kz",
  "https://youchef.kz",
].filter(Boolean);

// CORS
app.use(cors({ origin: allowedOrigins, credentials: true }));

// JSON + cookies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Статика для загруженных файлов (аватары и т.д.)
app.use("/uploads", express.static(path.resolve("backend/uploads")));

// ─── API роуты ────────────────────────────────────────────────────────────────
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/nutrition", nutritionRouter);
app.use("/api/translate", translateRouter);
app.use("/api/recipe-request", recipeRequestRouter);
app.use("/api/contact", contactRouter);
app.get("/api/auth/is-auth", isAuthenticated);

// ─── React фронт — ПОСЛЕ всех API роутов ─────────────────────────────────────
app.use(express.static(path.join(__dirname, "../my-react-app/dist"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".css")) res.setHeader("Content-Type", "text/css");
    if (filePath.endsWith(".js"))  res.setHeader("Content-Type", "application/javascript");
    if (filePath.endsWith(".svg")) res.setHeader("Content-Type", "image/svg+xml");
    if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
  }
}));

// SPA fallback — все остальные запросы отдают index.html
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-react-app/dist/index.html"));
});

// Запуск
app.listen(port, () => console.log(`Server started on PORT:${port}`));