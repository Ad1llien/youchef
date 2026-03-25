
import "dotenv/config";
dotenv.config();  // <-- очень важно
import express from "express";
import cookieParser from "cookie-parser";
import nutritionRouter from "./routes/nutritionRoutes.js"
import dotenv from "dotenv";
import cors from "cors";

 import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import path from "path";
import translateRouter from "./routes/translate.js"; // путь к твоему файлу с translate роутером
import { isAuthenticated } from "./controllers/authController.js";
import userRouter from "./routes/userRoutes.js";
const app = express();
const port = process.env.PORT || 4000;

connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
      origin: [
        "http://localhost:5174",
        "http://127.0.0.1:5174"
      ],
      credentials: true
    })
  );

app.get("/", (req, res) => res.send("API working fine "));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/nutrition", nutritionRouter);
app.use("/api/translate", translateRouter); // <--- вот это подключение
app.get("/api/auth/is-auth", isAuthenticated);
app.use("/uploads", express.static(path.resolve("backend/uploads")));
app.listen(port, () => console.log(`Server started on PORT:${port}`));
