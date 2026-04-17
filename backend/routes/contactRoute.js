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

  // Отправка модераторам в Telegram
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

  // Подтверждение пользователю на email
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "📩 We received your message — YouChef",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          
          <div style="background: #242D96; padding: 28px 24px; text-align: center;">
            <img src="https://youchef.kz/icons/logo-192.png" width="64" height="64" style="border-radius: 14px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" alt="YouChef" />
            <div style="color: white; font-size: 22px; font-weight: 600; letter-spacing: 1px;">YouChef</div>
            <div style="color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 4px;">Support Team</div>
          </div>

          <div style="padding: 28px 24px; background: #ffffff;">
            <p style="color: #333; font-size: 15px; margin: 0 0 16px;">Hello, <strong>${fullName}</strong>!</p>
            <p style="color: #333; font-size: 15px; margin: 0 0 24px;">We received your message and will get back to you as soon as possible.</p>

            <div style="background: #f5f7ff; border-left: 4px solid #242D96; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="color: #888; font-size: 12px; margin: 0 0 6px;">Your message:</p>
              <p style="color: #242D96; font-size: 15px; line-height: 1.6; margin: 0;">${message}</p>
            </div>

            <p style="color: #888; font-size: 13px; margin: 0;">
              If you have additional questions, visit our 
              <a href="https://youchef.kz/contact" style="color: #242D96; text-decoration: none;">Contact page</a>.
            </p>
          </div>

          <div style="background: #f9f9f9; padding: 16px 24px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #aaa; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} YouChef · <a href="https://youchef.kz" style="color: #aaa; text-decoration: none;">youchef.kz</a></p>
          </div>

        </div>
      `
    });
    console.log(`📧 Подтверждение отправлено на ${email}`);
  } catch (emailErr) {
    console.error("Ошибка отправки подтверждения:", emailErr.message);
  }

  res.json({ success: true });
});

export default router;