import express from "express";
import transporter from "../config/nodemailer.js";
import { bot, MODERATORS } from "../bot.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { fullName, email, message } = req.body;
  
    console.log("Contact received:", { fullName, email, message });
    console.log("MODERATORS:", MODERATORS);
    console.log("Trying to send to:", MODERATORS[0]);
  
    if (!fullName || !email || !message) {
      return res.json({ success: false, message: "Заполните все поля" });
    }
  
    const text = `
  📩 Новое обращение в поддержку
  
  👤 Имя: ${fullName}
  📧 Email: ${email}
  💬 Сообщение: ${message}
    `;
  
    for (const modId of MODERATORS) {
      try {
        await bot.sendMessage(modId, text, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✉️ Ответить на email", callback_data: `support_email_${email}` }],
            ],
          },
        });
      } catch (err) {
        console.error(`❌ Не удалось отправить модеру ${modId}:`, err.message);
      }
    }
  
    res.json({ success: true });
  });

export default router;