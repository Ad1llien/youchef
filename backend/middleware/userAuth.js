import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

export default async function userAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user; // ✅ сохраняем объект пользователя
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}