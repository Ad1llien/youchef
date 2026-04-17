import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Анализ фото — КБЖУ
router.post("/analyze-food", async (req, res) => {
  const { imageBase64, mediaType } = req.body;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 },
          },
          {
            type: "text",
            text: `Analyze this food image and return ONLY a JSON object with no extra text:
{
  "dish": "dish name in English",
  "calories": number per 100g,
  "protein": number in grams per 100g,
  "carbs": number in grams per 100g,
  "fat": number in grams per 100g,
  "portion": estimated portion size in grams,
  "total_calories": total calories for the portion,
  "ingredients": ["ingredient1", "ingredient2"],
  "confidence": "high/medium/low"
}`
          }
        ]
      }]
    });

    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);
    res.json({ success: true, data });
  } catch (err) {
    console.error("AI analyze error:", err.message);
    res.json({ success: false, message: "Failed to analyze image" });
  }
});

// Meal plan на неделю
router.post("/meal-plan", async (req, res) => {
  const { preferences } = req.body;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `Create a 7-day meal plan based on these preferences: "${preferences}".
Return ONLY a JSON object with no extra text:
{
  "plan": [
    {
      "day": "Monday",
      "breakfast": { "name": "dish name", "calories": number, "time": "prep time" },
      "lunch": { "name": "dish name", "calories": number, "time": "prep time" },
      "dinner": { "name": "dish name", "calories": number, "time": "prep time" }
    }
  ],
  "total_daily_calories": number,
  "notes": "brief nutrition note"
}`
      }]
    });

    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Meal plan error:", err.message);
    res.json({ success: false, message: "Failed to generate meal plan" });
  }
});

export default router;