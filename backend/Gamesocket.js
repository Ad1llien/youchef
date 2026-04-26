// gameSocket.js — подключи к своему Express серверу:
// const { initGameSocket } = require('./gameSocket');
// initGameSocket(httpServer);

const { Server } = require("socket.io");
const mongoose = require("mongoose");

// ─── MongoDB схемы ───────────────────────────────────────────────────────────

const battleSchema = new mongoose.Schema({
  players: [{ userId: String, username: String, avatar: String }],
  winnerId: String,
  scores: [{ userId: String, score: Number }],
  rounds: Number,
  duration: Number, // сек
  createdAt: { type: Date, default: Date.now },
});

const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  username: String,
  avatar: String,
  totalScore: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  battles: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const Battle = mongoose.models.Battle || mongoose.model("Battle", battleSchema);
const Leaderboard = mongoose.models.Leaderboard || mongoose.model("Leaderboard", leaderboardSchema);

// ─── 11 блюд (от лёгкого к сложному) ────────────────────────────────────────
const QUESTIONS = [
  { mealId: "52772", name: "Chicken Tikka Masala",  aliases: ["tikka masala", "chicken tikka", "tikka"], difficulty: 1 },
  { mealId: "52771", name: "Spicy Arrabiata Penne", aliases: ["arrabiata", "penne arrabiata", "pasta"],  difficulty: 1 },
  { mealId: "53049", name: "Sushi",                 aliases: ["sushi rolls", "japanese sushi"],          difficulty: 1 },
  { mealId: "52803", name: "Beef Wellington",       aliases: ["wellington", "beef welly"],               difficulty: 2 },
  { mealId: "52844", name: "Beef and Mustard Pie",  aliases: ["beef pie", "mustard pie"],                difficulty: 2 },
  { mealId: "52959", name: "Biga",                  aliases: ["biga bread", "sourdough starter"],        difficulty: 2 },
  { mealId: "53006", name: "Piri-piri chicken",     aliases: ["piri piri", "peri peri chicken"],         difficulty: 3 },
  { mealId: "52866", name: "Osso Buco alla Milanese", aliases: ["osso buco", "ossobuco"],               difficulty: 3 },
  { mealId: "52972", name: "Chicken Congee",        aliases: ["congee", "rice porridge"],                difficulty: 3 },
  { mealId: "53000", name: "BeaverTails",           aliases: ["beaver tail", "fried dough"],             difficulty: 4 },
  { mealId: "53049", name: "Kumpir",                aliases: ["kumpir potato", "turkish potato"],        difficulty: 4 },
];

// Загружаем thumbnail из MealDB
async function getMealThumb(mealId) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const data = await res.json();
    return data.meals?.[0]?.strMealThumb || null;
  } catch {
    return null;
  }
}

// ─── Состояние сервера ───────────────────────────────────────────────────────
const matchmakingQueue = []; // [{ socketId, userId, username, avatar, joinedAt }]
const activeRooms = new Map(); // roomId → RoomState

function createRoomId() {
  return `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function checkAnswer(userAnswer, question) {
  const clean = (s) => s.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
  const ua = clean(userAnswer);
  const correctName = clean(question.name);
  if (ua === correctName) return true;
  for (const alias of question.aliases) {
    if (ua === clean(alias)) return true;
    // fuzzy: длинные ответы — допускаем 1 опечатку
    if (ua.length > 4 && levenshtein(ua, clean(alias)) <= 1) return true;
  }
  // частичное совпадение (минимум 60% слов)
  const correctWords = correctName.split(" ");
  const matchedWords = correctWords.filter((w) => ua.includes(w));
  return matchedWords.length / correctWords.length >= 0.6;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function calcScore(timeLeft, attempt, isFirst) {
  // timeLeft: 0-10, attempt: 1,2,3... isFirst: bool
  const base = isFirst ? 100 : 60;
  const timeMult = timeLeft >= 8 ? 2 : timeLeft >= 5 ? 1.5 : 1;
  const attemptPenalty = (attempt - 1) * 10;
  return Math.max(0, Math.round(base * timeMult - attemptPenalty));
}

// ─── Главная функция инициализации ───────────────────────────────────────────
function initGameSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`[Game] connected: ${socket.id}`);

    // ── 1. Начать поиск ──────────────────────────────────────────────────────
    socket.on("find_match", ({ userId, username, avatar }) => {
      // убрать из очереди если уже был
      const existing = matchmakingQueue.findIndex((p) => p.userId === userId);
      if (existing !== -1) matchmakingQueue.splice(existing, 1);

      matchmakingQueue.push({ socketId: socket.id, userId, username, avatar, joinedAt: Date.now() });
      socket.emit("searching", { queueSize: matchmakingQueue.length });
      console.log(`[MM] Queue: ${matchmakingQueue.length}`);

      // Есть 2 игрока — создаём матч
      if (matchmakingQueue.length >= 2) {
        const [p1, p2] = matchmakingQueue.splice(0, 2);
        const roomId = createRoomId();

        const room = {
          id: roomId,
          players: [
            { ...p1, score: 0, ready: false, connected: true },
            { ...p2, score: 0, ready: false, connected: true },
          ],
          phase: "ready_check", // ready_check | playing | ended
          readyTimer: null,
          currentRound: 0,
          questions: [...QUESTIONS],
          roundTimer: null,
          roundStartTime: null,
          answers: {}, // { userId: { answer, timeLeft, attempt, score } }
          gameStartTime: null,
        };
        activeRooms.set(roomId, room);

        const s1 = io.sockets.sockets.get(p1.socketId);
        const s2 = io.sockets.sockets.get(p2.socketId);
        if (s1) s1.join(roomId);
        if (s2) s2.join(roomId);

        // Уведомляем обоих
        io.to(roomId).emit("match_found", {
          roomId,
          players: room.players.map((p) => ({
            userId: p.userId, username: p.username, avatar: p.avatar,
          })),
          readyTimeout: 10,
        });

        // Таймер 10 сек на ready check
        room.readyTimer = setTimeout(() => {
          const r = activeRooms.get(roomId);
          if (!r || r.phase !== "ready_check") return;
          // кто не готов — выгоняем, кто готов — обратно в очередь
          r.players.forEach((p) => {
            const sock = io.sockets.sockets.get(p.socketId);
            if (!p.ready) {
              if (sock) sock.emit("ready_timeout", { message: "Ты не нажал «Готов». Поиск остановлен." });
            } else {
              if (sock) {
                sock.leave(roomId);
                sock.emit("back_to_queue", { message: "Соперник не был готов. Ищем нового..." });
                // возвращаем в очередь
                matchmakingQueue.push({ socketId: p.socketId, userId: p.userId, username: p.username, avatar: p.avatar, joinedAt: Date.now() });
              }
            }
          });
          activeRooms.delete(roomId);
        }, 10000);
      }
    });

    // ── 2. Готов ─────────────────────────────────────────────────────────────
    socket.on("player_ready", ({ roomId, userId }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.phase !== "ready_check") return;
      const player = room.players.find((p) => p.userId === userId);
      if (player) player.ready = true;

      io.to(roomId).emit("player_ready_update", {
        players: room.players.map((p) => ({ userId: p.userId, ready: p.ready })),
      });

      // Оба готовы
      if (room.players.every((p) => p.ready)) {
        clearTimeout(room.readyTimer);
        room.phase = "playing";
        room.gameStartTime = Date.now();
        startNextRound(io, roomId);
      }
    });

    // ── 3. Ответ игрока ──────────────────────────────────────────────────────
    socket.on("submit_answer", ({ roomId, userId, answer }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.phase !== "playing") return;
      const q = room.questions[room.currentRound];
      if (!q) return;

      // Инициализируем запись для этого игрока
      if (!room.answers[userId]) {
        room.answers[userId] = { attempt: 0, solved: false, score: 0 };
      }
      const pa = room.answers[userId];
      if (pa.solved) return; // уже ответил верно

      pa.attempt++;
      const correct = checkAnswer(answer, q);
      const timeLeft = Math.max(0, 10 - Math.floor((Date.now() - room.roundStartTime) / 1000));

      if (correct) {
        pa.solved = true;
        const isFirst = !Object.values(room.answers).some((a) => a.solved && a !== pa);
        const pts = calcScore(timeLeft, pa.attempt, isFirst);
        pa.score = pts;
        const player = room.players.find((p) => p.userId === userId);
        if (player) player.score += pts;

        // Сообщаем всей комнате
        io.to(roomId).emit("answer_correct", {
          userId,
          pts,
          timeLeft,
          attempt: pa.attempt,
          scores: room.players.map((p) => ({ userId: p.userId, score: p.score })),
        });

        // Оба ответили верно → переходим к следующему раунду
        const solvedCount = Object.values(room.answers).filter((a) => a.solved).length;
        if (solvedCount >= 2) {
          clearTimeout(room.roundTimer);
          setTimeout(() => nextRound(io, roomId), 2000);
        }
      } else {
        socket.emit("answer_wrong", { attempt: pa.attempt, hint: pa.attempt >= 2 ? getHint(q.name) : null });
      }
    });

    // ── 4. Отмена поиска ─────────────────────────────────────────────────────
    socket.on("cancel_search", ({ userId }) => {
      const idx = matchmakingQueue.findIndex((p) => p.userId === userId);
      if (idx !== -1) matchmakingQueue.splice(idx, 1);
      socket.emit("search_cancelled");
    });

    // ── 5. Отключение ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      // убрать из очереди
      const qi = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
      if (qi !== -1) matchmakingQueue.splice(qi, 1);

      // найти активную комнату
      for (const [roomId, room] of activeRooms) {
        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          player.connected = false;
          if (room.phase === "playing") {
            clearTimeout(room.roundTimer);
            // противник побеждает
            const winner = room.players.find((p) => p.userId !== player.userId);
            io.to(roomId).emit("opponent_disconnected", {
              winnerId: winner?.userId,
              message: "Соперник отключился. Ты победил!",
            });
            endGame(io, roomId, winner?.userId);
          }
          break;
        }
      }
    });

    // ── Leaderboard ──────────────────────────────────────────────────────────
    socket.on("get_leaderboard", async () => {
      try {
        const top = await Leaderboard.find().sort({ totalScore: -1 }).limit(20).lean();
        socket.emit("leaderboard_data", { leaderboard: top });
      } catch (e) {
        socket.emit("leaderboard_data", { leaderboard: [] });
      }
    });
  });

  return io;
}

// ─── Вспомогательные функции ─────────────────────────────────────────────────

async function startNextRound(io, roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;
  room.currentRound = 0;
  room.answers = {};
  await sendRound(io, roomId);
}

async function nextRound(io, roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;
  room.currentRound++;
  room.answers = {};
  if (room.currentRound >= room.questions.length) {
    endGame(io, roomId, null);
    return;
  }
  io.to(roomId).emit("round_transition", { nextRound: room.currentRound + 1, total: room.questions.length });
  await new Promise((r) => setTimeout(r, 2500));
  await sendRound(io, roomId);
}

async function sendRound(io, roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;
  const q = room.questions[room.currentRound];
  if (!q) { endGame(io, roomId, null); return; }

  const thumb = await getMealThumb(q.mealId);
  room.roundStartTime = Date.now();

  io.to(roomId).emit("new_round", {
    round: room.currentRound + 1,
    total: room.questions.length,
    image: thumb,
    difficulty: q.difficulty,
    timeLimit: 10,
  });

  // Таймер 10 сек
  room.roundTimer = setTimeout(() => {
    const r = activeRooms.get(roomId);
    if (!r || r.phase !== "playing") return;
    io.to(roomId).emit("round_timeout", {
      correctAnswer: q.name,
      scores: r.players.map((p) => ({ userId: p.userId, score: p.score })),
    });
    setTimeout(() => nextRound(io, roomId), 2500);
  }, 10000);
}

async function endGame(io, roomId, forcedWinnerId) {
  const room = activeRooms.get(roomId);
  if (!room) return;
  room.phase = "ended";
  clearTimeout(room.roundTimer);
  clearTimeout(room.readyTimer);

  const [p1, p2] = room.players;
  let winnerId = forcedWinnerId;
  if (!winnerId) {
    if (p1.score > p2.score) winnerId = p1.userId;
    else if (p2.score > p1.score) winnerId = p2.userId;
    else winnerId = null; // ничья
  }

  const duration = Math.floor((Date.now() - (room.gameStartTime || Date.now())) / 1000);

  // Сохранить в MongoDB
  try {
    await Battle.create({
      players: room.players.map((p) => ({ userId: p.userId, username: p.username, avatar: p.avatar })),
      winnerId,
      scores: room.players.map((p) => ({ userId: p.userId, score: p.score })),
      rounds: room.currentRound + 1,
      duration,
    });

    // Обновить leaderboard
    for (const p of room.players) {
      const isWinner = p.userId === winnerId;
      await Leaderboard.findOneAndUpdate(
        { userId: p.userId },
        {
          $set: { username: p.username, avatar: p.avatar, updatedAt: new Date() },
          $inc: { totalScore: p.score, battles: 1, wins: isWinner ? 1 : 0, losses: isWinner ? 0 : 1 },
          $max: { bestScore: p.score },
        },
        { upsert: true, new: true }
      ).then(async (doc) => {
        doc.winRate = doc.battles > 0 ? Math.round((doc.wins / doc.battles) * 100) : 0;
        await doc.save();
      });
    }
  } catch (e) {
    console.error("[Game] DB save error:", e.message);
  }

  io.to(roomId).emit("game_over", {
    winnerId,
    scores: room.players.map((p) => ({ userId: p.userId, username: p.username, score: p.score })),
    isDraw: winnerId === null,
  });

  activeRooms.delete(roomId);
}

function getHint(name) {
  const words = name.split(" ");
  if (words.length === 1) return name[0] + "_ ".repeat(name.length - 1).trim();
  return words.map((w) => w[0] + "_".repeat(w.length - 1)).join(" ");
}

module.exports = { initGameSocket, Battle, Leaderboard };