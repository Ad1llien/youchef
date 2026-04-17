import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import User from "../models/userModels.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CACHE_FILE = path.resolve(
  "C:\\Users\\Asus\\Desktop\\projects\\technical_check\\youchef\\backend\\nutrition-cache.json"
);

if (!fs.existsSync(CACHE_FILE)) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify({}), "utf-8");
}

router.post("/:id", userAuth, async (req, res) => {
  const mealId = req.params.id;
  const { ingredients, mealName, instructions } = req.body;

  try {
    const FREE_KBJU_LIMIT = 10;
    let currentUser = await User.findById(req.user._id).select("premium freeKbjuViewsUsed");

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // 1️⃣ Сначала проверяем кэш
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    const cached = cacheData[mealId];

    // 2️⃣ Если блюдо в кэше — возвращаем без инкремента
    if (cached) {
      return res.json({
        ...cached,
        premium: currentUser.premium,
        freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
        freeKbjuLimit: FREE_KBJU_LIMIT,
        remainingViews: Math.max(0, FREE_KBJU_LIMIT - currentUser.freeKbjuViewsUsed),
      });
    }

    // 3️⃣ Проверяем лимит только если блюда НЕТ в кэше
    if (!currentUser.premium && currentUser.freeKbjuViewsUsed >= FREE_KBJU_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
        freeKbjuLimit: FREE_KBJU_LIMIT,
        remainingViews: 0,
        message: "Free KBJU limit reached. Buy premium to continue.",
      });
    }

    // 4️⃣ Инкрементируем счётчик только для новых блюд
    if (!currentUser.premium) {
      currentUser = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { freeKbjuViewsUsed: 1 } },
        { new: true, select: "premium freeKbjuViewsUsed" }
      );
    }

    // 5️⃣ Запрос к OpenAI с улучшенным промптом
    let nutrition = { calories: 0, protein: 0, fat: 0, carbs: 0 };

    try {
      const ingredientList = ingredients
        .map((i) => `- ${i.ingredient}: ${i.measure}`)
        .join("\n");

      const prompt = `You are a professional nutritionist and chef.

Calculate the nutritional values PER ONE SERVING of this dish.

Dish name: ${mealName}

Ingredients (total for the whole recipe):
${ingredientList}

Cooking method:
${instructions ? instructions.slice(0, 500) : "Standard cooking"}

Rules:
- Estimate how many servings this recipe makes (usually 2-6 people)
- Divide total nutrition by number of servings
- Account for cooking method (oil absorption when frying, water loss when baking, etc.)
- Be realistic — a typical main dish serving is 400-700 kcal
- A salad serving is 100-300 kcal
- A soup serving is 150-350 kcal

Return ONLY this JSON with no extra text, no markdown, no explanation:
{"calories":number,"protein":number,"fat":number,"carbs":number}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
      });

      const raw = completion.choices[0].message.content.trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      nutrition = JSON.parse(clean);

      // Санитизация — не допускаем абсурдных значений
      nutrition.calories = Math.min(Math.max(Math.round(nutrition.calories), 50), 1500);
      nutrition.protein = Math.min(Math.max(Math.round(nutrition.protein), 1), 150);
      nutrition.fat = Math.min(Math.max(Math.round(nutrition.fat), 1), 100);
      nutrition.carbs = Math.min(Math.max(Math.round(nutrition.carbs), 1), 200);

    } catch (openAiErr) {
      console.warn("[Nutrition] OpenAI request failed:", openAiErr.message);
    }

    // 6️⃣ Сохраняем в кэш
    cacheData[mealId] = nutrition;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), "utf-8");

    res.json({
      ...nutrition,
      premium: currentUser.premium,
      freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
      freeKbjuLimit: FREE_KBJU_LIMIT,
      remainingViews: Math.max(0, FREE_KBJU_LIMIT - currentUser.freeKbjuViewsUsed),
    });

  } catch (err) {
    console.error("[Nutrition] Fatal error:", err);
    res.json({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  }
});

export default router;