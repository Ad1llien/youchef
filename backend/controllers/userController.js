// backend/controllers/userController.js
import User from "../models/userModels.js";

export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // _id, не id
    if (!user) return res.json({ success: false, message: "User not found" });

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const avatarUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { returnDocument: "after" } // ← исправлено
    );

    res.json({ success: true, avatar: avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Upload error" });
  }
};