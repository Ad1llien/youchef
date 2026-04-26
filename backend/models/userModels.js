import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: ""  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  premium: { type: Boolean, default: false },
  freeKbjuViewsUsed: { type: Number, default: 0 },
  viewedMeals: { type: [String], default: [] },
  telegramId: { type: String, unique: true, sparse: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
  avatar: { type: String, default: "" },
  verifyToken: { type: String, default: "" },
  verifyTokenExpireAt: { type: Number, default: 0 },
  googleId: { type: String, default: "" },

  // ─── AI лимиты ────────────────────────────────────────────────────────────
  aiPhotoUsed: { type: Number, default: 0 }, // кол-во использованных анализов фото
  aiPlanUsed:  { type: Number, default: 0 }, // кол-во использованных планов питания

  // AI запросы — последние 20
  aiHistory: {
    type: [{
      type: { type: String, enum: ["plan", "photo"], default: "plan" },
      query: { type: String, default: "" },
      result: { type: mongoose.Schema.Types.Mixed },
      createdAt: { type: Date, default: Date.now },
    }],
    default: [],
  },

  // История просмотров блюд — последние 10
  mealHistory: {
    type: [{
      idMeal: { type: String, required: true },
      strMeal: { type: String, default: "" },
      strMealThumb: { type: String, default: "" },
      strCategory: { type: String, default: "" },
      viewedAt: { type: Date, default: Date.now },
    }],
    default: [],
  },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;