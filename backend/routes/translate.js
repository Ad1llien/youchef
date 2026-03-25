import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

router.post("/", async (req, res) => { // обратите внимание: "/" здесь, а не "/translate"
  const { text, target = "en" } = req.body;
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target }),
      }
    );
    const data = await response.json();
    res.json({ translated: data.data?.translations?.[0]?.translatedText || text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ translated: text });
  }
});

export default router;