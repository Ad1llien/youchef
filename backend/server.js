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
import { isAuthenticated } from "./controllers/authController.js";
import "./bot.js";
const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// MongoDB
connectDB();
const allowedOrigins = [
      "http://localhost:5174", // локально
      "https://youchef-front.onrender.com", // Render frontend
      "https://www.youchef.com", // будущий .com
      "https://www.youchef.kz", // будущий .kz
].filter(Boolean);
// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// JSON
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Статика для фото
app.use("/uploads", express.static(path.resolve("backend/uploads")));

// Роуты
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/nutrition", nutritionRouter);
app.use("/api/translate", translateRouter);
app.use("/api/recipe-request", recipeRequestRouter);
app.get("/api/auth/is-auth", isAuthenticated);

// Тест
app.get("/", (req, res) => res.send("API working fine"));
// Отдаём React фронт
const __dirnameReact = path.resolve(); // путь до корня проекта
app.use(express.static(path.join(__dirname, "../my-react-app/dist")));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-react-app/dist/index.html"));
});
// Запуск
app.listen(port, () => console.log(`Server started on PORT:${port}`));
