import { useState, useEffect, useRef, useCallback } from "react";
import "./MiniGame.css";
import { gsap } from "gsap";

// ─── Web Audio Sound Engine ───────────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _ctx = null;
const getCtx = () => {
  if (!_ctx) _ctx = new AudioCtx();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
};

const sounds = {
  // Поймал ингредиент — приятный "дзынь"
  catch: () => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start(); o.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  },

  // COMBO — восходящий аккорд
  combo: (n) => {
    try {
      const ctx = getCtx();
      [0, 0.06, 0.12].forEach((delay, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = 440 * Math.pow(1.25, i + Math.min(n, 5));
        g.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + 0.4);
      });
    } catch (e) {}
  },

  // Испорченный продукт — резкий "бум" (шум с фильтром)
  bad: () => {
    try {
      const ctx = getCtx();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      }
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      src.buffer = buf;
      f.type = "lowpass";
      f.frequency.value = 200;
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.6;
      src.start();
    } catch (e) {}
  },

  // Уровень пройден — победный джингл C E G C
  levelUp: () => {
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "triangle";
        o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t); o.stop(t + 0.4);
      });
    } catch (e) {}
  },

  // Бонус — магический нарастающий звук
  bonus: () => {
    try {
      const ctx = getCtx();
      for (let i = 0; i < 5; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        const t = ctx.currentTime + i * 0.05;
        o.frequency.setValueAtTime(600 + i * 200, t);
        o.frequency.exponentialRampToValueAtTime(1800 + i * 100, t + 0.2);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.start(t); o.stop(t + 0.25);
      }
    } catch (e) {}
  },

  // Таймер тикает — последние 3 секунды
  tick: () => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 1000;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.start(); o.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  },

  // Конец игры — нисходящий мотив
  gameOver: () => {
    try {
      const ctx = getCtx();
      [400, 350, 300, 220].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sawtooth";
        o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t); o.stop(t + 0.35);
      });
    } catch (e) {}
  },
};

// ─── Dishes ───────────────────────────────────────────────────────────────────
const DISHES = [
  {
    name: "Chicken Tikka Masala",
    mealId: "52772",
    ingredients: ["Chicken", "Tomato", "Garlic", "Onion", "Cream"],
    bad: ["Pepper", "Butter", "Sugar", "Egg", "Flour"],
  },
  {
    name: "Beef Rendang",
    mealId: "52193",
    ingredients: ["Beef", "Coconut Milk", "Onion", "Garlic", "Ginger"],
    bad: ["Cream", "Flour", "Sugar", "Butter", "Milk"],
  },
  {
    name: "Pad Thai",
    mealId: "53049",
    ingredients: ["Tofu", "Egg", "Spring Onions", "Garlic", "Lime"],
    bad: ["Cream", "Flour", "Milk", "Butter", "Cheese"],
  },
  {
    name: "Sushi Rolls",
    mealId: "53049",
    ingredients: ["Salmon", "Rice", "Cucumber", "Avocado", "Soy Sauce"],
    bad: ["Flour", "Butter", "Cream", "Milk", "Sugar"],
  },
  {
    name: "Beef Wellington",
    mealId: "52803",
    ingredients: ["Beef", "Mushrooms", "Puff Pastry", "Butter", "Garlic"],
    bad: ["Tofu", "Soy Sauce", "Rice", "Lime", "Cucumber"],
  },
  {
    name: "Kazakh Plov",
    mealId: "52959",
    ingredients: ["Lamb", "Rice", "Carrot", "Onion", "Garlic"],
    bad: ["Cream", "Flour", "Sugar", "Tomato", "Egg"],
  },
  {
    name: "Beshbarmak",
    mealId: "52959",
    ingredients: ["Lamb", "Onion", "Flour", "Egg", "Pepper"],
    bad: ["Cream", "Butter", "Sugar", "Tomato", "Coconut Milk"],
  },
];

const ING_IMG = (name) =>
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-small.png`;

// ─── Canvas particle burst ────────────────────────────────────────────────────
function burstParticles(canvas, x, y, color, count = 18) {
  const ctx = canvas.getContext("2d");
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2.5 + Math.random() * 5.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      life: 1,
      decay: 0.022 + Math.random() * 0.018,
      r: 3 + Math.random() * 5,
      color,
    });
  }
  let raf;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let any = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      any = true;
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (any) raf = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  tick();
  return () => cancelAnimationFrame(raf);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MiniGame({ onClose }) {
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [collected, setCollected] = useState([]);
  const [dishMeta, setDishMeta] = useState(null);
  const [timerPct, setTimerPct] = useState(100);
  const [basketState, setBasketState] = useState("idle");
  const [popups, setPopups] = useState([]);
  const [screenFlash, setScreenFlash] = useState(null);

  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const basketRef = useRef(null);
  const bxRef = useRef(320);
  const runRef = useRef(false);
  const itemsRef = useRef([]);
  const lvlRef = useRef(1);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const timerSecRef = useRef(60);
  const timerIvRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const spawnTRef = useRef(0);
  const spawnIRef = useRef(1300);
  const dishRef = useRef(null);
  const collRef = useRef([]);
  const fbTimer = useRef(null);
  const popId = useRef(0);

  // ── Load dish ──────────────────────────────────────────────────────────────
  const loadDish = useCallback(async (idx) => {
    const d = DISHES[idx % DISHES.length];
    dishRef.current = d;
    collRef.current = d.ingredients.map(() => false);
    setCollected([...collRef.current]);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${d.mealId}`);
      const data = await res.json();
      setDishMeta({
        name: d.name,
        img: data.meals?.[0]?.strMealThumb ?? null,
        area: data.meals?.[0]?.strArea ?? "",
      });
    } catch {
      setDishMeta({ name: d.name, img: null, area: "" });
    }
  }, []);

  // ── Feedback ───────────────────────────────────────────────────────────────
  const showFB = useCallback((msg, color) => {
    clearTimeout(fbTimer.current);
    setFeedback({ msg, color });
    fbTimer.current = setTimeout(() => setFeedback(null), 1200);
  }, []);

  // ── Score popup ────────────────────────────────────────────────────────────
  const addPopup = useCallback((pts, x, y) => {
    const id = popId.current++;
    setPopups((p) => [...p, { id, pts, x, y }]);
    setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 900);
  }, []);

  // ── Screen flash ───────────────────────────────────────────────────────────
  const flash = useCallback((type) => {
    setScreenFlash(type);
    setTimeout(() => setScreenFlash(null), 350);
  }, []);

  // ── Basket animation (CSS fallback) ───────────────────────────────────────
  const animBasket = useCallback((type) => {
    setBasketState(type);
    setTimeout(() => setBasketState("idle"), type === "shake" ? 500 : 300);
  }, []);

  // ── Spawn item ─────────────────────────────────────────────────────────────
  const spawnItem = useCallback(() => {
    if (!dishRef.current || !gameRef.current) return;
    const d = dishRef.current;
    const aW = gameRef.current.offsetWidth;
    const pool = [
      ...d.ingredients, ...d.ingredients, ...d.ingredients,
      ...d.bad, ...d.bad,
      ...(Math.random() < 0.07 ? ["__bonus__"] : []),
    ];
    const name = pool[Math.floor(Math.random() * pool.length)];
    const type = name === "__bonus__" ? "bonus" : d.ingredients.includes(name) ? "good" : "bad";
    const x = 32 + Math.random() * (aW - 64);
    const speed = 115 + lvlRef.current * 24 + Math.random() * 45;
    const wobDir = Math.random() < 0.35 ? (Math.random() < 0.5 ? 1 : -1) : 0;
    const wobAmp = wobDir * (18 + Math.random() * 28);
    const wobFreq = 1.4 + Math.random() * 0.8;
    const id = `${Date.now()}-${Math.random()}`;

    const el = document.createElement("div");
    el.className = `yc-item yc-item--${type}`;
    if (type === "bonus") {
      el.innerHTML = `<div class="yc-star">✦</div>`;
    } else {
      el.innerHTML = `
        <div class="yc-item-inner">
          <img src="${ING_IMG(name)}" alt="${name}" draggable="false" />
          <span>${name}</span>
        </div>`;
    }
    el.style.left = x + "px";
    el.style.top = "-48px";
    gameRef.current.appendChild(el);
    itemsRef.current.push({ id, el, x, y: -48, speed, type, name, wobDir, wobAmp, wobFreq, age: 0 });
  }, []);

  // ── Handle catch ───────────────────────────────────────────────────────────
  const handleCatch = useCallback((it, sx, sy) => {
    // Particles
    const canvas = canvasRef.current;
    if (canvas) {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const col = it.type === "bad" ? "#e74c3c" : it.type === "bonus" ? "#f5d080" : "#27ae60";
      burstParticles(canvas, sx, sy + 20, col, it.type === "bonus" ? 32 : 18);
    }

    if (it.type === "good") {
      const d = dishRef.current;
      const idx = d.ingredients.indexOf(it.name);
      if (idx !== -1 && !collRef.current[idx]) {
        // ✅ Новый ингредиент пойман
        collRef.current[idx] = true;
        setCollected([...collRef.current]);
        comboRef.current++;
        setCombo(comboRef.current);

        const mult = comboRef.current >= 5 ? 3 : comboRef.current >= 3 ? 2 : 1;
        const pts = 10 * mult + (lvlRef.current - 1) * 3;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        addPopup(pts, sx, sy);
        flash("good");

        // 🔊 Звук: combo если ≥3, иначе обычный catch
        if (comboRef.current >= 3) {
          sounds.combo(comboRef.current);
        } else {
          sounds.catch();
        }

        // GSAP bounce
        if (basketRef.current) {
          gsap.timeline()
            .to(basketRef.current, { scaleY: 0.7, scaleX: 1.3, duration: 0.07, ease: "power2.out" })
            .to(basketRef.current, { scaleY: 1, scaleX: 1, duration: 0.25, ease: "elastic.out(1,0.4)" });
        }

        const label =
          comboRef.current >= 5 ? `🔥 MEGA COMBO ×${comboRef.current}! +${pts}` :
          comboRef.current >= 3 ? `⚡ COMBO ×${comboRef.current}! +${pts}` :
          `+${pts}`;
        showFB(label, comboRef.current >= 3 ? "#ff6b35" : "#e8b84b");

        if (collRef.current.every(Boolean)) setTimeout(() => triggerLevelUp(), 500);

      } else {
        // Дубликат ингредиента — небольшой бонус
        scoreRef.current += 3;
        setScore(scoreRef.current);
        addPopup(3, sx, sy);
        sounds.catch();
        animBasket("bounce");
      }

    } else if (it.type === "bonus") {
      // 💎 Бонус
      const pts = 50 + lvlRef.current * 10;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      comboRef.current += 2;
      setCombo(comboRef.current);
      addPopup(pts, sx, sy);
      flash("good");
      sounds.bonus(); // 🔊
      if (basketRef.current) {
        gsap.timeline()
          .to(basketRef.current, { scaleY: 0.7, scaleX: 1.3, duration: 0.07, ease: "power2.out" })
          .to(basketRef.current, { scaleY: 1, scaleX: 1, duration: 0.25, ease: "elastic.out(1,0.4)" });
      }
      showFB(`💎 BONUS! +${pts}`, "#f5d080");

    } else {
      // ☠️ Испорченный продукт
      comboRef.current = 0;
      setCombo(0);
      flash("bad");
      sounds.bad(); // 🔊
      if (basketRef.current) {
        gsap.to(basketRef.current, {
          x: [-10, 10, -8, 8, -4, 4, 0],
          duration: 0.5,
          ease: "none",
        });
      }
      triggerLoseLife(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFB, addPopup, flash, animBasket]);

  // ── Game loop ──────────────────────────────────────────────────────────────
  const loop = useCallback((ts) => {
    if (!runRef.current) return;
    const dt = lastTRef.current ? ts - lastTRef.current : 16;
    lastTRef.current = ts;
    spawnTRef.current += dt;
    if (spawnTRef.current >= spawnIRef.current) {
      spawnTRef.current = 0;
      spawnItem();
    }
    const aH = (gameRef.current?.offsetHeight ?? 500) - 58;
    const bTop = (gameRef.current?.offsetHeight ?? 500) - 106;
    const bx = bxRef.current;
    const alive = [];
    for (const it of itemsRef.current) {
      it.age += dt / 1000;
      it.y += it.speed * (dt / 1000);
      const sx = it.x + (it.wobDir ? it.wobAmp * Math.sin(it.wobFreq * it.age * Math.PI * 2) : 0);
      it.el.style.top = it.y + "px";
      it.el.style.left = sx + "px";
      if (it.y >= bTop - 4 && it.y < bTop + 60 && Math.abs(sx - bx) < 54) {
        it.el.remove();
        handleCatch(it, sx, bTop);
        continue;
      }
      if (it.y > aH) {
        it.el.remove();
        if (it.type === "good") { comboRef.current = 0; setCombo(0); }
        continue;
      }
      alive.push(it);
    }
    itemsRef.current = alive;
    rafRef.current = requestAnimationFrame(loop);
  }, [spawnItem, handleCatch]);

  // ── Level up ───────────────────────────────────────────────────────────────
  const triggerLevelUp = useCallback(() => {
    sounds.levelUp(); // 🔊
    runRef.current = false;
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerIvRef.current);
    scoreRef.current += 80;
    setScore(scoreRef.current);
    const nl = lvlRef.current + 1;
    lvlRef.current = nl;
    setLevel(nl);
    itemsRef.current.forEach((i) => i.el.remove());
    itemsRef.current = [];
    spawnIRef.current = Math.max(480, 1300 - nl * 85);
    setPhase("levelup");
    showFB("🍽️ DISH COMPLETE! +80", "#27ae60");
    loadDish(nl - 1).then(() => {
      setTimeout(() => {
        timerSecRef.current = 60;
        setTimerPct(100);
        setPhase("playing");
        runRef.current = true;
        lastTRef.current = 0;
        spawnTRef.current = 0;
        startTimerFn();
        rafRef.current = requestAnimationFrame(loop);
      }, 1600);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDish, loop, showFB]);

  // ── Lose life ──────────────────────────────────────────────────────────────
  const triggerLoseLife = useCallback((timeout) => {
    livesRef.current--;
    setLives(livesRef.current);
    itemsRef.current.forEach((i) => i.el.remove());
    itemsRef.current = [];
    if (livesRef.current <= 0) {
      runRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerIvRef.current);
      sounds.gameOver(); // 🔊
      setTimeout(() => setPhase("gameover"), 300);
      return;
    }
    showFB(timeout ? "⏰ TIME'S UP!" : "💀 SPOILED FOOD!", "#e74c3c");
    if (timeout) {
      timerSecRef.current = 60;
      setTimerPct(100);
      startTimerFn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFB]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startTimerFn = useCallback(() => {
    clearInterval(timerIvRef.current);
    timerIvRef.current = setInterval(() => {
      timerSecRef.current--;
      const pct = Math.max(0, (timerSecRef.current / 60) * 100);
      setTimerPct(pct);
      // 🔊 Тик в последние 3 секунды
      if (timerSecRef.current <= 3 && timerSecRef.current > 0) {
        sounds.tick();
      }
      if (timerSecRef.current <= 0) {
        clearInterval(timerIvRef.current);
        triggerLoseLife(true);
      }
    }, 1000);
  }, [triggerLoseLife]);

  // ── Start game ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    scoreRef.current = 0; livesRef.current = 3; lvlRef.current = 1; comboRef.current = 0;
    spawnIRef.current = 1300; timerSecRef.current = 60;
    setScore(0); setLives(3); setLevel(1); setCombo(0); setTimerPct(100);
    itemsRef.current.forEach((i) => i.el.remove());
    itemsRef.current = [];
    loadDish(0).then(() => {
      setPhase("playing");
      runRef.current = true;
      lastTRef.current = 0;
      spawnTRef.current = 0;
      startTimerFn();
      rafRef.current = requestAnimationFrame(loop);
    });
  }, [loadDish, loop, startTimerFn]);

  // ── Mouse / touch ──────────────────────────────────────────────────────────
  const handleMove = useCallback((e) => {
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    bxRef.current = Math.max(48, Math.min(cx - rect.left, (gameRef.current?.offsetWidth ?? 640) - 48));
    if (basketRef.current) basketRef.current.style.left = (bxRef.current - 48) + "px";
  }, []);

  // ── Resize canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current && gameRef.current) {
        canvasRef.current.width = gameRef.current.offsetWidth;
        canvasRef.current.height = gameRef.current.offsetHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    loadDish(0);
    return () => {
      runRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerIvRef.current);
      itemsRef.current.forEach((i) => i.el?.remove());
    };
  }, [loadDish]);

  const d = dishRef.current;
  const timerColor = timerPct > 50 ? "#e8b84b" : timerPct > 25 ? "#e67e22" : "#e74c3c";

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="yc-root">
      {/* HEADER */}
      <header className="yc-header">
        <div className="yc-logo">
          <span className="yc-logo-you">You</span><span className="yc-logo-chef">Chef</span>
          <span className="yc-logo-tag">mini game</span>
        </div>
        <div className="yc-hud">
          <div className="yc-hud-box">
            <span className="yc-hud-lbl">Score</span>
            <span className="yc-hud-val">{score.toLocaleString()}</span>
          </div>
          <div className="yc-hud-box">
            <span className="yc-hud-lbl">Level</span>
            <span className="yc-hud-val">{level}</span>
          </div>
          <div className="yc-hud-box">
            <span className="yc-hud-lbl">Lives</span>
            <div className="yc-hearts">
              {[1,2,3].map(n => (
                <span key={n} className={`yc-h ${n <= lives ? "alive" : "dead"}`}>♥</span>
              ))}
            </div>
          </div>
          {combo >= 2 && (
            <div className="yc-combo">
              <span className="yc-combo-x">×{combo}</span>
              <span className="yc-combo-lbl">COMBO</span>
            </div>
          )}
        </div>
        {onClose && <button className="yc-x" onClick={onClose}>✕</button>}
      </header>

      {/* RECIPE BAR */}
      {d && (
        <div className="yc-recipe-bar">
          {dishMeta?.img && (
            <img className="yc-dish-thumb" src={dishMeta.img + "/small"} alt={d.name} />
          )}
          <span className="yc-dish-name">{d.name}</span>
          <div className="yc-rings">
            {d.ingredients.map((ing, i) => (
              <div key={i} className={`yc-ring ${collected[i] ? "done" : ""}`}>
                <img src={ING_IMG(ing)} alt={ing} />
                {collected[i] && <span className="yc-check">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAME AREA */}
      <div
        className="yc-arena"
        ref={gameRef}
        onMouseMove={handleMove}
        onTouchMove={(e) => { e.preventDefault(); handleMove(e); }}
      >
        <canvas ref={canvasRef} className="yc-canvas" />
        <div className="yc-grid" />
        <div className="yc-floor" />

        {/* Timer bar */}
        <div className="yc-timer-wrap">
          <div className="yc-timer-bar" style={{ width: timerPct + "%", background: timerColor }} />
        </div>

        {/* Screen flash */}
        {screenFlash && <div className={`yc-flash yc-flash--${screenFlash}`} />}

        {/* Basket */}
        <div
          ref={basketRef}
          className={`yc-basket yc-basket--${basketState}`}
          style={{ left: bxRef.current - 48 + "px" }}
        >
          <div className="yc-basket-rim" />
          <div className="yc-basket-body">
            <div className="yc-basket-stripe" />
            <div className="yc-basket-stripe" />
            <div className="yc-basket-stripe" />
          </div>
          <div className="yc-basket-shadow" />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="yc-fb" style={{ color: feedback.color }}>
            {feedback.msg}
          </div>
        )}

        {/* Score popups */}
        {popups.map(p => (
          <div key={p.id} className="yc-pop" style={{ left: p.x - 22 + "px", top: p.y + "px" }}>
            +{p.pts}
          </div>
        ))}

        {/* ── OVERLAYS ── */}
        {phase === "intro" && (
          <div className="yc-ov">
            {dishMeta?.img && (
              <div className="yc-ov-dishimg-wrap">
                <img src={dishMeta.img + "/medium"} alt="" className="yc-ov-dishimg" />
                <div className="yc-ov-dishimg-shine" />
              </div>
            )}
            <div className="yc-ov-chef">👨‍🍳</div>
            <h2 className="yc-ov-title">YouChef Game</h2>
            <p className="yc-ov-desc">Catch ingredients to complete the recipe!<br/>Avoid spoiled products or lose a life.</p>
            {d && (
              <div className="yc-ov-preview">
                <span className="yc-ov-dlabel">First dish: <strong>{d.name}</strong></span>
                <div className="yc-ov-ings">
                  {d.ingredients.map(ing => (
                    <div key={ing} className="yc-ov-ing">
                      <img src={ING_IMG(ing)} alt={ing} />
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button className="yc-btn" onClick={startGame}>🍳 Start Cooking!</button>
          </div>
        )}

        {phase === "levelup" && (
          <div className="yc-ov yc-ov--levelup">
            <div className="yc-ov-trophy">🏆</div>
            <h2 className="yc-ov-title" style={{ color: "#e8b84b" }}>Dish Complete!</h2>
            <p className="yc-ov-desc">+80 bonus points<br/>Preparing next dish…</p>
            <div className="yc-lu-bar"><div className="yc-lu-bar-fill" /></div>
          </div>
        )}

        {phase === "gameover" && (
          <div className="yc-ov yc-ov--gameover">
            <div className="yc-ov-plate">🍽️</div>
            <h2 className="yc-ov-title">Game Over</h2>
            <div className="yc-go-stats">
              <div className="yc-go-stat">
                <span className="yc-go-val">{score.toLocaleString()}</span>
                <span className="yc-go-lbl">Final Score</span>
              </div>
              <div className="yc-go-stat">
                <span className="yc-go-val">{level}</span>
                <span className="yc-go-lbl">Levels</span>
              </div>
            </div>
            <button className="yc-btn" onClick={startGame}>🔄 Play Again</button>
            {onClose && (
              <button className="yc-btn yc-btn--ghost" onClick={onClose}>← Back to YouChef</button>
            )}
          </div>
        )}
      </div>

      {/* HINTS */}
      <div className="yc-hints">
        <span>🖱️ Move mouse</span>
        <span>✅ Catch ingredients</span>
        <span>💀 Avoid spoiled</span>
        <span>💎 Bonus = extra pts</span>
        <span>⚡ Combos = ×2 ×3</span>
      </div>
    </div>
  );
}