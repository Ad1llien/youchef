import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

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

router.post("/:id", async (req, res) => {
  const mealId = req.params.id;
  const { ingredients, mealName, instructions  } = req.body; // <-- получаем название блюда с фронта

  try {
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));

    if (cacheData[mealId]) {
      return res.json(cacheData[mealId]);
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

    res.json(nutrition);
  } catch (err) {
    console.error("[Nutrition] Fatal error:", err);
    res.json({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  }
});

export default router;