import express from "express";
import mongoose from "mongoose";
import adminAuth from "../middleware/adminAuth.js";
import User from "../models/userModels.js";

const adminRouter = express.Router();

// ─── Статистика ───────────────────────────────────────────────────────────────
adminRouter.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ premium: true });
    const verifiedUsers = await User.countDocuments({ isAccountVerified: true });
    const telegramLinked = await User.countDocuments({ telegramId: { $exists: true, $ne: null } });

    // Регистрации за последние 7 дней
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.aggregate([
      { $match: { _id: { $gte: new mongoose.Types.ObjectId(Math.floor(sevenDaysAgo / 1000).toString(16).padStart(8, "0") + "0000000000000000") } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$_id" } } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Заполняем пустые дни
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = recentUsers.find(r => r._id === key);
      days.push({ date: key, count: found?.count || 0 });
    }

    // AI использование
    const totalAiPhoto = await User.aggregate([{ $group: { _id: null, total: { $sum: "$aiPhotoUsed" } } }]);
    const totalAiPlan = await User.aggregate([{ $group: { _id: null, total: { $sum: "$aiPlanUsed" } } }]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        premiumUsers,
        verifiedUsers,
        telegramLinked,
        freeUsers: totalUsers - premiumUsers,
        registrationsByDay: days,
        aiPhotoTotal: totalAiPhoto[0]?.total || 0,
        aiPlanTotal: totalAiPlan[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Heatmap данные за год ────────────────────────────────────────────────────
adminRouter.get("/heatmap", adminAuth, async (req, res) => {
  try {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const registrations = await User.aggregate([
      { $match: { _id: { $gte: new mongoose.Types.ObjectId(Math.floor(yearAgo / 1000).toString(16).padStart(8, "0") + "0000000000000000") } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$_id" } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const aiRequests = await User.aggregate([
      { $unwind: "$aiHistory" },
      { $match: { "aiHistory.createdAt": { $gte: yearAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$aiHistory.createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, registrations, aiRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Список пользователей ─────────────────────────────────────────────────────
adminRouter.get("/users", adminAuth, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, filter = "all" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (filter === "premium") query.premium = true;
    if (filter === "free") query.premium = false;
    if (filter === "verified") query.isAccountVerified = true;

    const users = await User.find(query)
      .select("name email premium isAccountVerified telegramId aiPhotoUsed aiPlanUsed role _id")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Выдать/снять Premium ─────────────────────────────────────────────────────
adminRouter.patch("/users/:id/premium", adminAuth, async (req, res) => {
  try {
    const { premium } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { premium: Boolean(premium) },
      { new: true }
    ).select("name email premium");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Сбросить AI лимиты ───────────────────────────────────────────────────────
adminRouter.patch("/users/:id/reset-limits", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { aiPhotoUsed: 0, aiPlanUsed: 0 },
      { new: true }
    ).select("name email aiPhotoUsed aiPlanUsed");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Удалить пользователя ─────────────────────────────────────────────────────
adminRouter.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    // Нельзя удалить самого себя
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default adminRouter;