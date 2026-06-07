import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import userAuth from "../middleware/userAuth.js";
import { getUserData, uploadAvatar } from "../controllers/userController.js";
import User from "../models/userModels.js";

const userRouter = express.Router();

// ─── Disk storage для аватаров ────────────────────────────────────────────────
const uploadDir = path.join("backend/uploads/avatars");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const userId = req.user?._id?.toString() || Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${userId}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// ─── Геолокация (proxy для ipapi.co) ─────────────────────────────────────────
userRouter.get("/geoip", async (req, res) => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    res.json({ country_code: data.country_code || "KZ" });
  } catch {
    res.json({ country_code: "KZ" });
  }
});

// ─── Основные роуты ───────────────────────────────────────────────────────────
userRouter.get("/data", userAuth, getUserData);
userRouter.post("/avatar", userAuth, upload.single("avatar"), uploadAvatar);

// ─── AI История ───────────────────────────────────────────────────────────────
// Сохранить AI запрос
userRouter.post("/history/ai", userAuth, async (req, res) => {
  try {
    const { type, query, result } = req.body;
    const entry = { type: type || "plan", query, result, createdAt: new Date() };

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        aiHistory: {
          $each: [entry],
          $slice: -20, // оставляем только последние 20
        },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Получить AI историю
userRouter.get("/history/ai", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("aiHistory");
    const history = (user?.aiHistory || []).slice().reverse(); // новые первыми
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Очистить AI историю
userRouter.delete("/history/ai", userAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { aiHistory: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── История просмотров блюд ─────────────────────────────────────────────────
// Сохранить просмотр блюда
userRouter.post("/history/meal", userAuth, async (req, res) => {
  try {
    const { idMeal, strMeal, strMealThumb, strCategory } = req.body;
    if (!idMeal) return res.status(400).json({ success: false, message: "idMeal required" });

    // Убираем если уже есть (чтобы переместить наверх)
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { mealHistory: { idMeal } },
    });

    const entry = { idMeal, strMeal, strMealThumb, strCategory, viewedAt: new Date() };

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        mealHistory: {
          $each: [entry],
          $slice: -10, // оставляем только последние 10
        },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Получить историю блюд
userRouter.get("/history/meal", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("mealHistory");
    const history = (user?.mealHistory || []).slice().reverse(); // новые первыми
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Очистить историю блюд
userRouter.delete("/history/meal", userAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { mealHistory: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default userRouter;