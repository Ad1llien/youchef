import mongoose from "mongoose";

const nutritionCacheSchema = new mongoose.Schema({
  mealId:   { type: String, unique: true, required: true },
  calories: { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("NutritionCache", nutritionCacheSchema);