import express from "express";
import OpenAI from "openai";
import User from "../models/userModels.js";
import NutritionCache from "../models/nutritionCache.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/:id", userAuth, async (req, res) => {
  const mealId = req.params.id;
  const { ingredients, mealName, instructions } = req.body;

  try {
    const FREE_KBJU_LIMIT = 10;

    // ─── 1. Получаем пользователя ─────────────────────────────────────────
    let currentUser = await User.findById(req.user._id).select(
      "premium freeKbjuViewsUsed viewedMeals"
    );

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // ─── 2. Проверяем лимит ───────────────────────────────────────────────
    const alreadyViewed = currentUser.viewedMeals?.includes(mealId);

    if (!currentUser.premium && !alreadyViewed && currentUser.freeKbjuViewsUsed >= FREE_KBJU_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
        freeKbjuLimit: FREE_KBJU_LIMIT,
        remainingViews: 0,
        message: "Free KBJU limit reached. Buy premium to continue.",
      });
    }

    // ─── 3. Ищем КБЖУ в MongoDB кэше ─────────────────────────────────────
    let cached = await NutritionCache.findOne({ mealId });

    // ─── 4. Если нет в кэше — считаем через OpenAI ───────────────────────
    if (!cached) {
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
- Be realistic — a typical main dish serving is 400-700 kcal
- A salad serving is 100-300 kcal
- A soup serving is 150-350 kcal
Return ONLY this JSON with no extra text:
{"calories":number,"protein":number,"fat":number,"carbs":number}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 100,
        });

        const raw = completion.choices[0].message.content.trim();
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        nutrition.calories = Math.min(Math.max(Math.round(parsed.calories), 50), 1500);
        nutrition.protein  = Math.min(Math.max(Math.round(parsed.protein),  1),  150);
        nutrition.fat      = Math.min(Math.max(Math.round(parsed.fat),      1),  100);
        nutrition.carbs    = Math.min(Math.max(Math.round(parsed.carbs),    1),  200);

        console.log(`[Nutrition] Calculated for ${mealName}:`, nutrition);

      } catch (openAiErr) {
        console.warn("[Nutrition] OpenAI failed:", openAiErr.message);
        if (openAiErr?.status === 429) {
          console.error("[Nutrition] ❌ OpenAI rate limit или закончились деньги! Проверь billing: https://platform.openai.com/account/billing");
        } else if (openAiErr?.status === 401) {
          console.error("[Nutrition] ❌ Неверный OpenAI API ключ! Проверь OPENAI_API_KEY в Render");
        } else if (openAiErr?.status === 500) {
          console.error("[Nutrition] ❌ Ошибка сервера OpenAI");
        } else {
          console.warn("[Nutrition] OpenAI failed:", openAiErr.message);
        }
      }

      // ─── 5. Сохраняем в MongoDB ───────────────────────────────────────
      try {
        cached = await NutritionCache.create({ mealId, ...nutrition });
        console.log(`[Nutrition] Saved to DB: ${mealId}`);
      } catch (dbErr) {
        console.warn("[Nutrition] DB save failed:", dbErr.message);
        cached = { mealId, ...nutrition };
      }
    } else {
      console.log(`[Nutrition] Found in DB cache: ${mealId}`);
    }

    // ─── 6. Обновляем счётчик пользователя ───────────────────────────────
    if (!alreadyViewed) {
      if (!currentUser.premium) {
        currentUser = await User.findByIdAndUpdate(
          req.user._id,
          {
            $inc: { freeKbjuViewsUsed: 1 },
            $addToSet: { viewedMeals: mealId },
          },
          { new: true, select: "premium freeKbjuViewsUsed viewedMeals" }
        );
      } else {
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { viewedMeals: mealId },
        });
      }
    }

    // ─── 7. Возвращаем результат ──────────────────────────────────────────
    return res.json({
      calories: cached.calories,
      protein:  cached.protein,
      fat:      cached.fat,
      carbs:    cached.carbs,
      premium:          currentUser.premium,
      freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
      freeKbjuLimit:    FREE_KBJU_LIMIT,
      remainingViews:   Math.max(0, FREE_KBJU_LIMIT - currentUser.freeKbjuViewsUsed),
    });

  } catch (err) {
    console.error("[Nutrition] Fatal error:", err);
    res.json({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  }
});

export default router;