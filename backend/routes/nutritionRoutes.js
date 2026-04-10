import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import User from "../models/userModels.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// путь к единому файлу кэша
const CACHE_FILE = path.resolve(
  "C:\\Users\\Asus\\Desktop\\projects\\technical_check\\youchef\\backend\\nutrition-cache.json"
);

// создаём пустой файл, если его нет
if (!fs.existsSync(CACHE_FILE)) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify({}), "utf-8");
}

router.post("/:id", userAuth, async (req, res) => {
  const mealId = req.params.id;
  const { ingredients, mealName, instructions  } = req.body; // <-- получаем название блюда с фронта

  try {
    const FREE_KBJU_LIMIT = 3;
    let currentUser = await User.findById(req.user._id).select("premium freeKbjuViewsUsed");

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!currentUser.premium && currentUser.freeKbjuViewsUsed >= FREE_KBJU_LIMIT) {
      const remainingViews = Math.max(
        0,
        FREE_KBJU_LIMIT - currentUser.freeKbjuViewsUsed
      );
      return res.status(403).json({
        success: false,
        limitReached: true,
        freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
        freeKbjuLimit: FREE_KBJU_LIMIT,
        remainingViews,
        message: "Free KBJU limit reached. Buy premium to continue.",
      });
    }

    if (!currentUser.premium) {
      currentUser = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { freeKbjuViewsUsed: 1 } },
        { new: true, select: "premium freeKbjuViewsUsed" }
      );
    }

    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));

    if (cacheData[mealId]) {
      return res.json({
        ...cacheData[mealId],
        premium: currentUser.premium,
        freeKbjuViewsUsed: currentUser.freeKbjuViewsUsed,
        freeKbjuLimit: FREE_KBJU_LIMIT,
        remainingViews: Math.max(
          0,
          FREE_KBJU_LIMIT - currentUser.freeKbjuViewsUsed
        ),
      });
    }

    let nutrition = { calories: 0, protein: 0, fat: 0, carbs: 0 };

    try {
      const ingredientList = ingredients
        .map((i) => `${i.ingredient} ${i.measure}`)
        .join(", ");

        const prompt = `
        You are a nutrition calculator.
        
        Calculate total nutrition for this meal.
        
        Meal name: ${mealName}
        
        Ingredients:
        ${ingredientList}
        
        Cooking instructions:
        ${instructions}
        
        Important:
        - Consider cooking method (frying, boiling, baking, oil usage)
        - Estimate realistic total values for the whole dish
        - Return ONLY valid JSON
        
        Format:
        {
          "calories": number,
          "protein": number,
          "fat": number,
          "carbs": number
        }
        `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      nutrition = JSON.parse(completion.choices[0].message.content);
    } catch (openAiErr) {
      console.warn("[Nutrition] OpenAI request failed:", openAiErr.message);
    }

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