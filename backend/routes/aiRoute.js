import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import userAuth from "../middleware/userAuth.js";
import User from "../models/userModels.js";

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FREE_LIMIT = 10;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB в байтах base64
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// ─── Общая проверка пользователя ─────────────────────────────────────────────
const checkUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { error: "Unauthorized" };
  if (!user.isAccountVerified) return { error: "Please verify your email before using AI features." };
  return { user };
};

// ─── Анализ фото — КБЖУ ──────────────────────────────────────────────────────
router.post("/analyze-food", userAuth, async (req, res) => {
  const { imageBase64, mediaType } = req.body;

  // 1. Проверка наличия данных
  if (!imageBase64 || !mediaType) {
    return res.status(400).json({ success: false, message: "Image and media type are required." });
  }

  // 2. Проверка типа файла
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
    return res.status(400).json({ success: false, message: "Only JPEG, PNG, WebP images are allowed." });
  }

  // 3. Проверка размера base64 (~4MB максимум)
  const imageSizeBytes = Buffer.byteLength(imageBase64, "base64");
  if (imageSizeBytes > MAX_IMAGE_SIZE) {
    return res.status(400).json({ success: false, message: "Image too large. Maximum size is 4MB." });
  }

  try {
    // 4. Проверка пользователя и верификации email
    const { user, error } = await checkUser(req.user._id);
    if (error) return res.status(401).json({ success: false, message: error });

    const used = user.aiPhotoUsed ?? 0;
    const isPremium = Boolean(user.premium);

    // 5. Проверка лимита
    if (!isPremium && used >= FREE_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        used,
        limit: FREE_LIMIT,
        message: "Free limit reached. Upgrade to Premium for unlimited analysis.",
      });
    }

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
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

    await User.findByIdAndUpdate(req.user._id, { $inc: { aiPhotoUsed: 1 } });

    res.json({ success: true, data, used: used + 1, limit: FREE_LIMIT, isPremium });
  } catch (err) {
    console.error("AI analyze error:", err.message);
    res.json({ success: false, message: "Failed to analyze image" });
  }
});

// ─── Meal plan ────────────────────────────────────────────────────────────────
router.post("/meal-plan", userAuth, async (req, res) => {
  const { preferences } = req.body;

  // 1. Проверка данных
  if (!preferences || typeof preferences !== "string") {
    return res.status(400).json({ success: false, message: "Preferences are required." });
  }

  // 2. Ограничение длины текста (защита от огромных промптов)
  if (preferences.length > 500) {
    return res.status(400).json({ success: false, message: "Preferences too long. Maximum 500 characters." });
  }

  try {
    // 3. Проверка пользователя и верификации email
    const { user, error } = await checkUser(req.user._id);
    if (error) return res.status(401).json({ success: false, message: error });

    const used = user.aiPlanUsed ?? 0;
    const isPremium = Boolean(user.premium);

    // 4. Проверка лимита
    if (!isPremium && used >= FREE_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        used,
        limit: FREE_LIMIT,
        message: "Free limit reached. Upgrade to Premium for unlimited meal plans.",
      });
    }

    const extractDays = (text) => {
      const lower = text.toLowerCase();
      const ruMap = { "один": 1, "одного": 1, "одну": 1, "два": 2, "две": 2, "три": 3, "четыре": 4, "пять": 5, "шесть": 6, "семь": 7, "восемь": 8, "девять": 9, "десять": 10, "неделю": 7, "неделя": 7, "недели": 7 };
      for (const [word, num] of Object.entries(ruMap)) {
        if (lower.includes(word)) return Math.min(num, 14);
      }
      const match = lower.match(/(\d+)\s*(дн|day|ден|дней)/);
      if (match) return Math.min(parseInt(match[1]), 14);
      const matchSimple = lower.match(/на\s+(\d+)/);
      if (matchSimple) return Math.min(parseInt(matchSimple[1]), 14);
      return 7;
    };

    const getDayNames = (count) => {
      const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      if (count <= 7) return weekdays.slice(0, count);
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      return Array.from({ length: count }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      });
    };

    const days = extractDays(preferences);
    const dayNames = getDayNames(days);

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `Create a ${days}-day meal plan based on these preferences: "${preferences}".

Important rules:
- Respect ALL dietary restrictions, allergies, religious requirements (halal, kosher, vegetarian, etc.)
- If user mentions lactose intolerance — no dairy products
- If user mentions peanut allergy — no peanuts or peanut products
- If user mentions Muslim/halal — no pork, no alcohol
- Match the number of days exactly: ${days} days
- Use these day names exactly: ${dayNames.join(", ")}

Return ONLY a valid JSON object with no extra text, no markdown:
{
  "plan": [
    {
      "day": "${dayNames[0]}",
      "breakfast": { "name": "dish name", "calories": number },
      "lunch": { "name": "dish name", "calories": number },
      "dinner": { "name": "dish name", "calories": number }
    }
  ],
  "total_daily_calories": number,
  "notes": "brief note about the plan respecting all restrictions"
}`
      }]
    });

    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    await User.findByIdAndUpdate(req.user._id, { $inc: { aiPlanUsed: 1 } });

    res.json({ success: true, data, used: used + 1, limit: FREE_LIMIT, isPremium });
  } catch (err) {
    console.error("Meal plan error:", err.message);
    res.json({ success: false, message: "Failed to generate meal plan" });
  }
});

// ─── Получить текущие лимиты ──────────────────────────────────────────────────
router.get("/limits", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("aiPhotoUsed aiPlanUsed premium isAccountVerified");
    res.json({
      success: true,
      photo: { used: user?.aiPhotoUsed ?? 0, limit: FREE_LIMIT },
      plan:  { used: user?.aiPlanUsed  ?? 0, limit: FREE_LIMIT },
      isPremium: Boolean(user?.premium),
      isVerified: Boolean(user?.isAccountVerified),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;