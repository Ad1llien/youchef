// backend/routes/userRoutes.js
import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData, uploadAvatar } from "../controllers/userController.js";
import upload from "../upload.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.post("/avatar", userAuth, upload.single("avatar"), uploadAvatar);

export default userRouter;