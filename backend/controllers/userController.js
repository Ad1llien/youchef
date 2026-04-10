import User from "../models/userModels.js";
import RecipeRequest from "../models/recipeRequest.js";
import { bot, MODERATORS } from "../bot.js";
import { sendRecipeToModerators } from "../bot.js";
// Получение данных пользователя
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        avatar: user.avatar || "",
        role: user.role,
        premium: Boolean(user.premium),
        freeKbjuViewsUsed: user.freeKbjuViewsUsed ?? 0,
        telegramId: user.telegramId || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// Загрузка аватара
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const avatarUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { returnDocument: "after" });

    res.json({ success: true, avatar: avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Upload error" });
  }
};

// Отправка рецепта в Telegram
export const sendRecipeToTelegram = async (req, res) => {
  try {
    const recipeData = req.body;

    // Сохраняем заявку в Mongo
    const newRequest = await RecipeRequest.create({
      ...recipeData,
      ingredients: JSON.parse(recipeData.ingredients || "[]"),
      isPremium: recipeData.isPremium === "true",
      photo: req.file ? req.file.buffer : null,
    });

    // Отправка модерам через телеграм
    await sendRecipeToModerators(recipeData, req.file);

    res.status(200).json({ success: true, message: "Заявка отправлена", id: newRequest._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};