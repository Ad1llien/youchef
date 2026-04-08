import mongoose from "mongoose";

const recipeRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    description: { type: String },
    video: { type: String },
    isPremium: { type: Boolean, default: false },
    userName: { type: String },
    userEmail: { type: String },
    photo: { type: Buffer }, // если пользователь загружает фото
    status: { type: String, default: "pending" }, // pending, accepted, rejected
  },
  { timestamps: true }
);

export default mongoose.model("RecipeRequest", recipeRequestSchema);