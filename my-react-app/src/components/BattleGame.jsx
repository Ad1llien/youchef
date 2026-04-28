// BattleGame.jsx — главный компонент онлайн-викторины
// Использует: socket.io-client, gsap (опционально)
// npm install socket.io-client gsap
import confetti from "canvas-confetti";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSocket } from "../hooks/useGameSocket";
import "./BattleGame.css";

const TOTAL_ROUNDS = 11;

// ─── Фазы игры ───────────────────────────────────────────────────────────────
const PHASE = {
  IDLE: "idle",
  SEARCHING: "searching",
  READY_CHECK: "ready_check",
  PLAYING: "playing",
  ROUND_RESULT: "round_result",
  GAME_OVER: "game_over",
  LEADERBOARD: "leaderboard",
};

export default function BattleGame({ user, onClose }) {
    console.log("BattleGame user:", user); // ← добавь временно

  const navigate = useNavigate();
  const { emit, on, off, connected } = useGameSocket();

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]); // [{ userId, username, avatar, score, ready }]
  const [myReady, setMyReady] = useState(false);
  const [readyCountdown, setReadyCountdown] = useState(10);
  const [round, setRound] = useState(0);
  const [roundImage, setRoundImage] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [answer, setAnswer] = useState("");
  const [answerResult, setAnswerResult] = useState(null); // "correct"|"wrong"|null
  const [hint, setHint] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const timerRef = useRef(null);
  const readyTimerRef = useRef(null);
  const inputRef = useRef(null);
  const fbTimerRef = useRef(null);

  const myId = user?._id || user?.id || user?.userId || user?.email;


  // ── Helpers ──────────────────────────────────────────────────────────────
  const showFeedback = useCallback((msg, type = "info") => {
    clearTimeout(fbTimerRef.current);
    setFeedback({ msg, type });
    fbTimerRef.current = setTimeout(() => setFeedback(null), 2000);
  }, []);

  const getMe = useCallback(() => players.find((p) => p.userId === myId), [players, myId]);
  const getOpponent = useCallback(() => players.find((p) => p.userId !== myId), [players, myId]);

  // ── Socket events ────────────────────────────────────────────────────────
  useEffect(() => {
    const handlers = {
      searching: ({ queueSize }) => {
        setPhase(PHASE.SEARCHING);
        showFeedback(`В очереди: ${queueSize} игрок(ов)`, "info");
      },

      match_found: ({ roomId: rid, players: ps, readyTimeout }) => {
        setRoomId(rid);
        setPlayers(ps.map((p) => ({ ...p, score: 0, ready: false })));
        setMyReady(false);
        setReadyCountdown(readyTimeout);
        setPhase(PHASE.READY_CHECK);

        // Обратный отсчёт 10 сек
        let t = readyTimeout;
        readyTimerRef.current = setInterval(() => {
          t--;
          setReadyCountdown(t);
          if (t <= 0) clearInterval(readyTimerRef.current);
        }, 1000);
      },

      player_ready_update: ({ players: ps }) => {
        setPlayers((prev) =>
          prev.map((p) => ({ ...p, ready: ps.find((pp) => pp.userId === p.userId)?.ready || false }))
        );
      },

      ready_timeout: ({ message }) => {
        clearInterval(readyTimerRef.current);
        setPhase(PHASE.IDLE);
        showFeedback(message, "error");
      },

      back_to_queue: ({ message }) => {
        clearInterval(readyTimerRef.current);
        showFeedback(message, "info");
        // Автоматически продолжаем поиск
        emit("find_match", { userId: myId, username: user?.username, avatar: user?.profilePhoto });
      },

      new_round: ({ round: r, total, image, difficulty: diff, timeLimit }) => {
        clearTimeout(timerRef.current);
        setRound(r);
        setDifficulty(diff);
        setRoundImage(image);
        setImageLoaded(false);
        setAnswer("");
        setAnswerResult(null);
        setHint(null);
        setAttempt(0);
        setRoundResult(null);
        setPhase(PHASE.PLAYING);
        setTimeLeft(timeLimit);

        let t = timeLimit;
        timerRef.current = setInterval(() => {
          t--;
          setTimeLeft(t);
          if (t <= 0) clearInterval(timerRef.current);
        }, 1000);

        setTimeout(() => inputRef.current?.focus(), 300);
      },

      answer_correct: ({ userId, pts, attempt: att, scores }) => {
        setPlayers((prev) =>
          prev.map((p) => ({ ...p, score: scores.find((s) => s.userId === p.userId)?.score || p.score }))
        );
        if (userId === myId) {
          setAnswerResult("correct");
          showFeedback(`✓ Верно! +${pts} очков`, "success");
        } else {
          const opp = getOpponent();
          showFeedback(`${opp?.username || "Соперник"} ответил первым! +${pts}`, "warning");
        }
      },

      answer_wrong: ({ attempt: att, hint: h }) => {
        setAttempt(att);
        setAnswerResult("wrong");
        if (h) setHint(h);
        setAnswer("");
        setTimeout(() => { setAnswerResult(null); inputRef.current?.focus(); }, 600);
      },

      round_transition: ({ nextRound: nr, total }) => {
        clearInterval(timerRef.current);
        setPhase(PHASE.ROUND_RESULT);
      },

      round_timeout: ({ correctAnswer, scores }) => {
        clearInterval(timerRef.current);
        setPlayers((prev) =>
          prev.map((p) => ({ ...p, score: scores.find((s) => s.userId === p.userId)?.score || p.score }))
        );
        setRoundResult({ correctAnswer });
        setPhase(PHASE.ROUND_RESULT);
      },

      game_over: ({ winnerId, scores, isDraw }) => {
        if (winnerId === myId) {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
        clearInterval(timerRef.current);
        setPlayers((prev) =>
          prev.map((p) => ({ ...p, score: scores.find((s) => s.userId === p.userId)?.score || p.score }))
        );
        setGameResult({ winnerId, isDraw });
        setPhase(PHASE.GAME_OVER);
      },

      opponent_disconnected: ({ message }) => {
        clearInterval(timerRef.current);
        showFeedback(message, "success");
      },

      leaderboard_data: ({ leaderboard: lb }) => {
        setLeaderboard(lb);
        setPhase(PHASE.LEADERBOARD);
      },
    };

    const cleanups = Object.entries(handlers).map(([event, handler]) => on(event, handler));
    return () => cleanups.forEach((fn) => fn && fn());
  }, [emit, on, myId, user, showFeedback, getOpponent]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const findMatch = () => {
    if (!connected) { showFeedback("Нет подключения к серверу", "error"); return; }
    emit("find_match", { userId: myId, username: user?.username || "Игрок", avatar: user?.profilePhoto || null });
  };

  const cancelSearch = () => {
    emit("cancel_search", { userId: myId });
    setPhase(PHASE.IDLE);
  };

  const pressReady = () => {
    if (myReady) return;
    setMyReady(true);
    emit("player_ready", { roomId, userId: myId });
    clearInterval(readyTimerRef.current);
  };

  const submitAnswer = (e) => {
    e?.preventDefault();
    if (!answer.trim() || answerResult === "correct" || phase !== PHASE.PLAYING) return;
    emit("submit_answer", { roomId, userId: myId, answer: answer.trim() });
  };

  const openLeaderboard = () => {
    emit("get_leaderboard");
  };

  // ── Difficulty stars ───────────────────────────────────────────────────────
  const DiffStars = ({ d }) => (
    <div className="bg-diff">
      {[1,2,3,4].map((n) => (
        <span key={n} className={`bg-star ${n <= d ? "active" : ""}`}>★</span>
      ))}
    </div>
  );

  // ── Avatar fallback ────────────────────────────────────────────────────────
  const Avatar = ({ player, size = 48 }) => (
    player?.avatar
      ? <img src={player.avatar} alt={player.username} className="bg-avatar" style={{ width: size, height: size }} />
      : <div className="bg-avatar bg-avatar--initial" style={{ width: size, height: size, fontSize: size * 0.4 }}>
          {(player?.username || "?")[0].toUpperCase()}
        </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  const opponent = getOpponent();
  const me = getMe();

  return (
    <div className="bg-root">
      {/* ── HEADER ── */}
      <header className="bg-header">
        <div className="bg-logo">
          <span className="bg-logo-you">You</span><span className="bg-logo-chef">Chef</span>
          <span className="bg-logo-badge">Battle</span>
        </div>
        <div className="bg-header-right">
          {phase === PHASE.IDLE && (
            <button className="bg-btn bg-btn--ghost bg-btn--sm" onClick={openLeaderboard}>
              🏆 Таблица лидеров
            </button>
          )}
          {onClose && <button className="bg-x" onClick={onClose}>✕</button>}
        </div>
      </header>

      {/* ── FEEDBACK TOAST ── */}
      {feedback && (
        <div className={`bg-toast bg-toast--${feedback.type}`}>{feedback.msg}</div>
      )}

      {/* ══════════════════ IDLE ══════════════════ */}
      {phase === PHASE.IDLE && (
        <div className="bg-screen bg-screen--idle">
          <div className="bg-idle-hero">
            <div className="bg-idle-icon">⚔️</div>
            <h1 className="bg-idle-title">Кулинарный Баттл</h1>
            <p className="bg-idle-desc">
              11 раундов · 10 секунд на блюдо<br/>
              Угадай блюдо по фото быстрее соперника!
            </p>
            <div className="bg-idle-rules">
              <div className="bg-rule"><span className="bg-rule-icon">🥇</span><span>+100 за первый ответ</span></div>
              <div className="bg-rule"><span className="bg-rule-icon">🥈</span><span>+60 за второй</span></div>
              <div className="bg-rule"><span className="bg-rule-icon">⚡</span><span>×2 если ответил за 3 сек</span></div>
              <div className="bg-rule"><span className="bg-rule-icon">❌</span><span>−10 за каждую попытку</span></div>
            </div>
            <button
              className="bg-btn bg-btn--primary bg-btn--lg"
              onClick={findMatch}
              disabled={!connected}
            >
              {connected ? "🔍 Найти соперника" : "⏳ Подключение..."}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ SEARCHING ══════════════════ */}
      {phase === PHASE.SEARCHING && (
        <div className="bg-screen bg-screen--searching">
          <div className="bg-search-ring">
            <div className="bg-search-pulse" />
            <div className="bg-search-pulse bg-search-pulse--2" />
            <div className="bg-search-dot">👨‍🍳</div>
          </div>
          <h2 className="bg-search-title">Ищем соперника...</h2>
          <p className="bg-search-sub">Это может занять несколько секунд</p>
          <button className="bg-btn bg-btn--ghost" onClick={cancelSearch}>Отмена</button>
        </div>
      )}

      {/* ══════════════════ READY CHECK ══════════════════ */}
      {phase === PHASE.READY_CHECK && (
        <div className="bg-screen bg-screen--ready">
          <h2 className="bg-ready-title">Соперник найден!</h2>
          <div className="bg-ready-players">
            {players.map((p) => (
              <div key={p.userId} className={`bg-ready-player ${p.ready ? "ready" : ""}`}>
                <Avatar player={p} size={64} />
                <span className="bg-rp-name">{p.userId === myId ? "Ты" : p.username}</span>
                <div className={`bg-rp-status ${p.ready ? "ready" : ""}`}>
                  {p.ready ? "✓ Готов!" : "⏳ Ждём..."}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-ready-timer">
            <svg viewBox="0 0 60 60" className="bg-timer-svg">
              <circle cx="30" cy="30" r="26" className="bg-timer-track" />
              <circle cx="30" cy="30" r="26" className="bg-timer-prog"
                strokeDasharray={`${(readyCountdown / 10) * 163} 163`} />
            </svg>
            <span className="bg-timer-num">{readyCountdown}</span>
          </div>
          {!myReady && (
            <button className="bg-btn bg-btn--primary bg-btn--lg" onClick={pressReady}>
              ✅ Готов!
            </button>
          )}
          {myReady && <p className="bg-ready-wait">Ждём соперника...</p>}
        </div>
      )}

      {/* ══════════════════ PLAYING ══════════════════ */}
      {(phase === PHASE.PLAYING || phase === PHASE.ROUND_RESULT) && (
        <div className="bg-screen bg-screen--playing">
          {/* Scoreboard */}
          <div className="bg-scoreboard">
            <div className="bg-player-score">
              <Avatar player={me} size={36} />
              <div>
                <div className="bg-ps-name">Ты</div>
                <div className="bg-ps-score">{me?.score || 0}</div>
              </div>
            </div>
            <div className="bg-round-info">
              <div className="bg-round-num">Раунд {round}/{TOTAL_ROUNDS}</div>
              <div className="bg-round-timer" style={{ color: timeLeft <= 3 ? "#e74c3c" : timeLeft <= 6 ? "#e67e22" : "#e8b84b" }}>
                {phase === PHASE.PLAYING ? timeLeft : "—"}
              </div>
              <div className="bg-round-progress">
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
                  <div key={i} className={`bg-rp-dot ${i < round ? "done" : i === round - 1 ? "active" : ""}`} />
                ))}
              </div>
            </div>
            <div className="bg-player-score bg-player-score--right">
              <div>
                <div className="bg-ps-name">{opponent?.username || "Соперник"}</div>
                <div className="bg-ps-score">{opponent?.score || 0}</div>
              </div>
              <Avatar player={opponent} size={36} />
            </div>
          </div>

          {/* Timer bar */}
          <div className="bg-timerbar-wrap">
            <div
              className="bg-timerbar"
              style={{
                width: phase === PHASE.PLAYING ? `${(timeLeft / 10) * 100}%` : "0%",
                background: timeLeft <= 3 ? "#e74c3c" : timeLeft <= 6 ? "#e67e22" : "#e8b84b",
                transition: "width 0.9s linear, background 0.5s",
              }}
            />
          </div>

          {/* Dish image */}
          <div className="bg-dish-wrap">
            {!imageLoaded && <div className="bg-dish-skeleton" />}
            {roundImage && (
              <img
                src={roundImage + "/medium"}
                alt="Угадай блюдо"
                className={`bg-dish-img ${imageLoaded ? "loaded" : ""}`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
            <DiffStars d={difficulty} />
            {phase === PHASE.ROUND_RESULT && roundResult && (
              <div className="bg-correct-reveal">
                <span>Правильный ответ:</span>
                <strong>{roundResult.correctAnswer}</strong>
              </div>
            )}
          </div>

          {/* Answer input */}
          {phase === PHASE.PLAYING && (
            <form className="bg-answer-form" onSubmit={submitAnswer}>
              {answerResult === "wrong" && (
                <div className="bg-wrong-msg">
                  Неверно! Попытка {attempt}{hint && <> · Подсказка: <code>{hint}</code></>}
                </div>
              )}
              {answerResult === "correct" && (
                <div className="bg-correct-msg">✓ Верно!</div>
              )}
              <div className="bg-answer-row">
                <input
                  ref={inputRef}
                  className={`bg-answer-input ${answerResult === "wrong" ? "shake" : ""} ${answerResult === "correct" ? "correct" : ""}`}
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); setAnswerResult(null); }}
                  placeholder="Название блюда..."
                  disabled={answerResult === "correct"}
                  autoComplete="off"
                />
                <button
                  className="bg-btn bg-btn--primary"
                  type="submit"
                  disabled={!answer.trim() || answerResult === "correct"}
                >
                  →
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ══════════════════ GAME OVER ══════════════════ */}
      {phase === PHASE.GAME_OVER && gameResult && (
        <div className="bg-screen bg-screen--gameover">
          <div className="bg-go-trophy">
            {gameResult.isDraw ? "🤝" : gameResult.winnerId === myId ? "🏆" : "😔"}
          </div>
          <h2 className="bg-go-title">
            {gameResult.isDraw ? "Ничья!" : gameResult.winnerId === myId ? "Ты победил!" : "Победил соперник!"}
          </h2>
          <div className="bg-go-scores">
            {players.map((p) => (
              <div key={p.userId} className={`bg-go-player ${p.userId === gameResult.winnerId ? "winner" : ""}`}>
                <Avatar player={p} size={56} />
                <div className="bg-go-pname">{p.userId === myId ? "Ты" : p.username}</div>
                <div className="bg-go-pscore">{p.score}</div>
                {p.userId === gameResult.winnerId && <div className="bg-go-crown">👑</div>}
              </div>
            ))}
          </div>
          <div className="bg-go-btns">
            <button className="bg-btn bg-btn--primary" onClick={findMatch}>🔍 Реванш!</button>
            <button className="bg-btn bg-btn--ghost" onClick={openLeaderboard}>🏆 Таблица лидеров</button>
          </div>
        </div>
      )}

      {/* ══════════════════ LEADERBOARD ══════════════════ */}
      {phase === PHASE.LEADERBOARD && (
        <div className="bg-screen bg-screen--lb">
          <div className="bg-lb-header">
            <h2 className="bg-lb-title">🏆 Таблица лидеров</h2>
            <button className="bg-x" onClick={() => setPhase(PHASE.IDLE)}>✕</button>
          </div>
          <div className="bg-lb-table">
            <div className="bg-lb-head">
              <span>#</span><span>Игрок</span><span>Очки</span><span>Победы</span><span>Батлы</span><span>Win%</span>
            </div>
            {leaderboard.map((p, i) => (
              <div key={p.userId} className={`bg-lb-row ${p.userId === myId ? "mine" : ""}`}>
                <span className="bg-lb-rank">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span className="bg-lb-pname">
                  {p.avatar && <img src={p.avatar} alt="" className="bg-lb-av" />}
                  {p.username}
                </span>
                <span className="bg-lb-val">{p.totalScore.toLocaleString()}</span>
                <span className="bg-lb-val">{p.wins}</span>
                <span className="bg-lb-val">{p.battles}</span>
                <span className="bg-lb-val">{p.winRate}%</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="bg-lb-empty">Пока нет данных</div>
            )}
          </div>
          <button className="bg-btn bg-btn--primary" style={{marginTop:"16px"}} onClick={() => setPhase(PHASE.IDLE)}>
            Играть!
          </button>
        </div>
      )}
    </div>
  );
}