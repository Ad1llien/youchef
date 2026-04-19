import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import userAuth from "../middleware/userAuth.js";
import { getUserData, uploadAvatar } from "../controllers/userController.js";

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// Получение данных пользователя
userRouter.get("/data", userAuth, getUserData);

// Загрузка аватара
userRouter.post("/avatar", userAuth, upload.single("avatar"), uploadAvatar);

export default userRouter;