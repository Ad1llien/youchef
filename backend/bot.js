import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import RecipeRequest from "./models/recipeRequest.js";
import transporter from "./config/nodemailer.js";
import User from "./models/userModels.js";
dotenv.config();

// ======================
// ИНИЦИАЛИЗАЦИЯ БОТА
// ======================
export const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

// ======================
// МОДЕРАТОРЫ
// ======================
export const MODERATORS = process.env.TG_ADMINS
  .split(",")
  .map((id) => parseInt(id.trim()));

console.log("Модеры:", MODERATORS);

// ======================
// ХРАНЕНИЕ СТРАНИЦ АДМИНА
// ======================
const adminPages = {};
const adminReplyMode = {};

// ======================
// ФУНКЦИЯ ОБНОВЛЕНИЯ/ОТПРАВКИ ОДНОГО СООБЩЕНИЯ
// ======================
async function sendOrUpdateMessage(userId, text, buttons) {
  const page = adminPages[userId];

  // если уже есть сообщение → обновляем
  if (page?.messageId) {
    try {
      await bot.editMessageText(text, {
        chat_id: userId,
        message_id: page.messageId,
        reply_markup: buttons.reply_markup,
      });
      return;
    } catch (err) {
      // игнорируем одинаковый текст
      if (!err.message.includes("message is not modified")) {
        console.error("Ошибка обновления сообщения:", err.message);
      }
    }
  }

  // если сообщения нет → создаем новое
  const sent = await bot.sendMessage(userId, text, buttons);
  if (!adminPages[userId]) adminPages[userId] = {};
  adminPages[userId].messageId = sent.message_id;
}

// ======================
// Функция отправки заявки модеру
// ======================
async function sendRequestToAdmin(userId, reqObj) {
  if (!reqObj) {
    return sendOrUpdateMessage(userId, "Новых заявок нет", {
      reply_markup: { inline_keyboard: [] },
    });
  }

  const text = `
🍳 Имя рецепта: ${reqObj.name}
🧂 Ингредиенты: ${reqObj.ingredients.join(", ")}
🎬 Видео: ${reqObj.video || "—"}
📝 Описание: ${reqObj.description || "—"}
💎 Премиум: ${reqObj.isPremium ? "Да" : "Нет"}
👤 Отправил: ${reqObj.userName} (${reqObj.userEmail})
`;

  const buttons = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Принять", callback_data: `accept_${reqObj._id}` },
          { text: "❌ Отклонить", callback_data: `reject_${reqObj._id}` },
          {
            text: "✉️ Написать",
            callback_data: `email_${reqObj.userEmail}_${reqObj._id}`,
          },
        ],
        [
          { text: "⬅️ Предыдущая", callback_data: "prev" },
          { text: "➡️ Следующая", callback_data: "next" },
        ],
      ],
    },
  };

  await sendOrUpdateMessage(userId, text, buttons);
}

// ======================
// /menu для модераторов
// ======================
bot.onText(/\/menu/, async (msg) => {
  const userId = msg.from.id;

  if (!MODERATORS.includes(userId)) {
    return bot.sendMessage(userId, "❌ У тебя нет доступа к админ-меню");
  }

  const requests = await RecipeRequest.find({ status: "pending" }).sort({
    createdAt: 1,
  });

  if (!requests.length) {
    return bot.sendMessage(userId, "Новых заявок пока нет");
  }

  adminPages[userId] = { requests, index: 0 };

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `🍳 Мои заявки (${requests.length})`,
            callback_data: "my_requests",
          },
        ],
        [
          {
            text: "📊 Статистика",
            callback_data: "stats",
          },
        ],
      ],
    },
  };


  const sent = await bot.sendMessage(userId, "📌 Модерторское меню:", options);
  adminPages[userId].messageId = sent.message_id;
});

// ======================
// CALLBACK кнопки
// ======================
bot.on("callback_query", async (query) => {
  const userId = query.from.id;
  const data = query.data;

  if (!MODERATORS.includes(userId)) {
    return bot.answerCallbackQuery(query.id, { text: "Нет доступа" });
  }

  if (!adminPages[userId]) {
    const requests = await RecipeRequest.find({ status: "pending" }).sort({
      createdAt: 1,
    });

    adminPages[userId] = {
      requests,
      index: 0,
      messageId: query.message.message_id,
    };
  }

  const page = adminPages[userId];

  if (!page.requests.length) {
    return sendOrUpdateMessage(userId, "Новых заявок нет", {
      reply_markup: { inline_keyboard: [] },
    });
  }

  try {
    if (data === "my_requests") {
      return sendRequestToAdmin(userId, page.requests[page.index]);
    }

    if (data === "next") {
      page.index = Math.min(page.index + 1, page.requests.length - 1);
      return sendRequestToAdmin(userId, page.requests[page.index]);
    }

    if (data === "prev") {
      page.index = Math.max(page.index - 1, 0);
      return sendRequestToAdmin(userId, page.requests[page.index]);
    }

    if (data === "stats") {
      const totalUsers = await User.countDocuments();
    
      const premiumUsers = await User.countDocuments({
        premium: true,
      });
    
      const pendingRequests = await RecipeRequest.countDocuments({
        status: "pending",
      });
    
      const statsText = `
    📊 Статистика YouChef
    
    👥 Всего пользователей: ${totalUsers}
    💎 Premium пользователей: ${premiumUsers}
    🍳 Заявок на модерации: ${pendingRequests}
    `;
    
      return sendOrUpdateMessage(userId, statsText, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Назад в меню",
                callback_data: "back_to_menu",
              },
            ],
          ],
        },
      });
    }

    if (data === "back_to_menu") {
      const requestsCount = await RecipeRequest.countDocuments({
        status: "pending",
      });
    
      return sendOrUpdateMessage(userId, "📌 Модераторское меню:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `🍳 Мои заявки (${requestsCount})`,
                callback_data: "my_requests",
              },
            ],
            [
              {
                text: "📊 Статистика",
                callback_data: "stats",
              },
            ],
          ],
        },
      });
    }

    // ======================
    // EMAIL MODE
    // ======================
    if (data.startsWith("email_")) {
      const [, email, requestId] = data.split("_");

      adminReplyMode[userId] = { email, requestId };

      return bot.sendMessage(
        userId,
        `✍️ Введите сообщение для ${email}\n\nСледующее сообщение будет отправлено на email.`
      );
    }

    // ======================
    // ACCEPT / REJECT
    // ======================
    if (data.startsWith("accept_") || data.startsWith("reject_")) {
      const [action, id] = data.split("_");
      const status = action === "accept" ? "accepted" : "rejected";

      const request = await RecipeRequest.findById(id);

      if (!request) {
        return bot.sendMessage(userId, "❌ Заявка не найдена");
      }

      // =========================
      // ACCEPT → ДОБАВЛЕНИЕ В JSON
      // =========================
      if (action === "accept") {
        const mealsPath = path.resolve(
          "C:/Users/Asus/Desktop/projects/technical_check/youchef/my-react-app/src/mealsDB.json"
        );

        let db = { meals: [] };

        if (fs.existsSync(mealsPath)) {
          const fileContent = fs.readFileSync(mealsPath, "utf-8");

          try {
            db = JSON.parse(fileContent);

            if (!db.meals || !Array.isArray(db.meals)) {
              db.meals = [];
            }
          } catch (err) {
            console.error("Ошибка JSON:", err.message);
            db = { meals: [] };
          }
        }

        const meals = db.meals;

        let newId = "1";

        if (meals.length > 0) {
          const lastMeal = meals[meals.length - 1];
          newId = String(Number(lastMeal?.idMeal || 0) + 1);
        }

        const newMeal = {
          idMeal: newId,
          strMeal: request.name,
          strMealAlternate: null,
          strCategory: "Custom",
          strArea: "User",
          strInstructions: request.description || "No instructions",
          strMealThumb: "",
          strTags: "UserRecipe",
          strYoutube: request.video || "",
          strSource: request.userName || "Community",
          strImageSource: null,
          strCreativeCommonsConfirmed: null,
          dateModified: new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        };

        request.ingredients.forEach((ingredient, index) => {
          newMeal[`strIngredient${index + 1}`] = ingredient;
          newMeal[`strMeasure${index + 1}`] = "";
        });

        db.meals.push(newMeal);

        fs.writeFileSync(mealsPath, JSON.stringify(db, null, 2), "utf-8");

        console.log("✅ Блюдо добавлено в JSON:", newMeal.strMeal);
      }

      await RecipeRequest.findByIdAndUpdate(id, { status });

      page.requests = page.requests.filter((r) => r._id != id);

      if (page.index >= page.requests.length) {
        page.index = Math.max(0, page.requests.length - 1);
      }

      await sendOrUpdateMessage(
        userId,
        action === "accept"
          ? "✅ Блюдо добавлено в mealsDB.json"
          : "❌ Заявка отклонена",
        { reply_markup: { inline_keyboard: [] } }
      );

      if (page.requests.length) {
        return sendRequestToAdmin(userId, page.requests[page.index]);
      } else {
        return sendOrUpdateMessage(userId, "📭 Новых заявок больше нет", {
          reply_markup: { inline_keyboard: [] },
        });
      }
    }

    bot.answerCallbackQuery(query.id);
  } catch (err) {
    console.error("Ошибка при обработке callback:", err.message);
    bot.sendMessage(userId, "❌ Произошла ошибка при обработке заявки");
  }
});

bot.on("web_app_data", async (msg) => {
  const data = JSON.parse(msg.web_app_data.data);

  if (data.action === "buy_premium") {
    const userId = data.userId;

    // Отправляем счёт пользователю
    bot.sendInvoice(userId, {
      title: "YouChef Premium",
      description: "Подписка на все премиум рецепты",
      payload: `premium_${userId}`,       // уникальный идентификатор
      provider_token: process.env.TG_PROVIDER_TOKEN,
      start_parameter: "premium-subscription",
      currency: "USD",
      prices: [{ label: "Premium", amount: 499 }], // $4.99 = 499 cents
      need_email: true
    });
  }
});

// ======================
// СООБЩЕНИЕ ОТ АДМИНА → EMAIL
// ======================
bot.on("message", async (msg) => {
  const userId = msg.from.id;

  if (!adminReplyMode[userId]) return;
  if (!MODERATORS.includes(userId)) return;
  if (msg.text.startsWith("/")) return;

  const { email } = adminReplyMode[userId];

  try {
    await transporter.sendMail({
      from: process.env.SMTP_SENDER,
      to: email,
      subject: "📩 Message from YouChef moderator",
      text: msg.text,
    });

    await bot.sendMessage(userId, `✅ Сообщение отправлено на ${email}`);
  } catch (err) {
    console.error("Ошибка email:", err.message);
    await bot.sendMessage(userId, "❌ Ошибка отправки email");
  }

  delete adminReplyMode[userId];
});


bot.on("successful_payment", async (msg) => {
  const userId = msg.successful_payment.invoice_payload.split("_")[1];

  // Обновляем пользователя в базе
  await User.findOneAndUpdate(
    { telegramId: userId },
    { premium: true },
    { upsert: true }
  );

  // Сообщаем пользователю
  bot.sendMessage(userId, "🎉 Вы успешно приобрели Premium!");
});
// ======================
// Отправка новой заявки модерам
// ======================
export const sendRecipeToModerators = async (recipeData, file) => {
  const message = `
Новая заявка 🍳
Имя рецепта: ${recipeData.name || "Не указано"}
Ингредиенты: ${recipeData.ingredients || "Не указано"}
Видео: ${recipeData.video || "Не указано"}
Описание: ${recipeData.description || "Не указано"}
Премиум: ${recipeData.isPremium === "true" ? "Да" : "Нет"}
Отправил: ${recipeData.userName || "Не указано"} (${recipeData.userEmail || "Не указано"})
  `;

  for (const modId of MODERATORS) {
    try {
      if (file) {
        const tmpDir = path.resolve("./tmp");

        // создаем папку если ее нет
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        const safeFileName = `${Date.now()}-${file.originalname}`;
        const tmpPath = path.join(tmpDir, safeFileName);

        fs.writeFileSync(tmpPath, file.buffer);

        await bot.sendPhoto(modId, fs.createReadStream(tmpPath));

        fs.unlinkSync(tmpPath);
      }

      await bot.sendMessage(modId, message);
      console.log(`✅ Успешно отправлено модеру ${modId}`);
    } catch (error) {
      console.error(
        `❌ Ошибка отправки модеру ${modId}:`,
        error.message
      );
    }
  }
};