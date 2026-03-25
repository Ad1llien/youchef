import express from "express";
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, resetPassword, sendResetOtp, verifyResetOtp, changePassword, } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-Account", verifyEmail);
authRouter.post("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-reset-otp", verifyResetOtp);
authRouter.post("/change-password", userAuth, changePassword);
authRouter.post("/verify-email", verifyEmail);
export default authRouter;
