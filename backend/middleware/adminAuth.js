import userAuth from "./userAuth.js";
import User from "../models/userModels.js";

const adminAuth = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      userAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const user = await User.findById(req.user._id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default adminAuth;