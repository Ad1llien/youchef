import express from "express";
import multer from "multer";
import userAuth from "../middleware/userAuth.js";
import { getUserData, uploadAvatar } from "../controllers/userController.js";

const userRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Получение данных пользователя
userRouter.get("/data", userAuth, getUserData);

// Загрузка аватара
userRouter.post("/avatar", userAuth, upload.single("avatar"), uploadAvatar);

export default userRouter;