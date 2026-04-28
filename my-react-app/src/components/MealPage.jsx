import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import "../styles/popularMeal.css";
import blueFav from '../icons/blueFav.svg';
import backIcon from "../icons/back.svg";
import "../styles/mealPage.css";
import youtubeLogo from '../icons/youtube.svg';
import line from '../icons/Line36.svg';
import Calculator from '../icons/Group135.svg';
import warn from '../icons/information-fill.svg';
import hybridMeals from "../mealsDB.json";
import { useUser } from "../context/UserContext";
import API_BASE_URL, { apiFetch } from "../config/api";

// ─── PDF Download ─────────────────────────────────────────────────────────────
function downloadMealAsPDF(meal, ingredients, nutrition) {
  const cal = nutrition?.calories || "—";
  const protein = nutrition?.protein || "—";
  const fat = nutrition?.fat || "—";
  const carbs = nutrition?.carbs || "—";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${meal.strMeal} — YouChef</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Teachers:wght@400;500;600;700&family=Taviraj:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Teachers', sans-serif; background: #FDFBE7; padding: 32px 24px; color: #1a1a2e; }
  .page { max-width: 720px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(36,45,150,0.12); }
  .header { background: #242D96; padding: 0; position: relative; overflow: hidden; }
  .header-top { display:flex; align-items:center; justify-content:space-between; padding:24px 32px 20px; }
  .brand-row { display:flex; align-items:center; gap:14px; }
  .logo-box { width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .logo-box img { width:38px; height:38px; object-fit:contain; }
  .brand-name { font-family:'Taviraj',serif; font-size:22px; font-weight:500; color:white; }
  .brand-sub { font-size:11px; color:rgba(255,255,255,0.5); margin-top:1px; }
  .header-badge { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:8px 16px; text-align:center; }
  .badge-tag { font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:2px; }
  .badge-cat { font-size:14px; font-weight:600; color:white; margin-top:2px; }
  .meal-hero { display:flex; }
  .meal-img { width:220px; height:200px; object-fit:cover; flex-shrink:0; }
  .meal-info { flex:1; padding:20px 24px; display:flex; flex-direction:column; justify-content:center; }
  .meal-title { font-family:'Taviraj',serif; font-size:22px; font-weight:500; color:white; margin-bottom:8px; line-height:1.3; }
  .meal-meta { display:flex; gap:8px; flex-wrap:wrap; }
  .meta-pill { background:rgba(255,255,255,0.12); border-radius:20px; padding:3px 12px; font-size:11px; color:rgba(255,255,255,0.8); }
  .nutrition-bar { display:flex; background:#f8f9ff; border-bottom:1px solid #eef0fb; }
  .nut-item { flex:1; text-align:center; padding:16px 8px; border-right:1px solid #eef0fb; }
  .nut-item:last-child { border-right:none; }
  .nut-val { font-size:22px; font-weight:700; color:#242D96; }
  .nut-label { font-size:11px; color:#788CA5; margin-top:2px; text-transform:uppercase; letter-spacing:1px; }
  .content { display:flex; }
  .left-col { width:260px; border-right:1px solid #f3f4f6; padding:24px; flex-shrink:0; }
  .right-col { flex:1; padding:24px; }
  .section-title { font-family:'Taviraj',serif; font-size:16px; font-weight:500; color:#242D96; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #eef0fb; display:flex; align-items:center; gap:8px; }
  .ing-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid #f9f9f9; }
  .ing-img { width:28px; height:28px; object-fit:contain; flex-shrink:0; }
  .ing-name { font-size:12px; font-weight:500; color:#242D96; flex:1; }
  .ing-measure { font-size:11px; color:#788CA5; white-space:nowrap; }
  .instructions { font-size:13px; line-height:1.8; color:#444; }
  .tear { position:relative; height:26px; display:flex; align-items:center; background:#FDFBE7; }
  .tear::before { content:''; position:absolute; left:-14px; width:28px; height:28px; border-radius:50%; background:#FDFBE7; }
  .tear::after { content:''; position:absolute; right:-14px; width:28px; height:28px; border-radius:50%; background:#FDFBE7; }
  .tear-line { flex:1; margin:0 14px; border-top:2px dashed #BBC8D8; }
  .footer { background:#242D96; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; }
  .footer-left { color:rgba(255,255,255,0.6); font-size:12px; }
  .footer-right { color:rgba(255,255,255,0.3); font-size:11px; }
  @media print { body { background:white; padding:0; } .page { box-shadow:none; border-radius:0; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="brand-row">
        <div class="logo-box"><img src="https://youchef.kz/icons/logo-192.png" alt="YouChef" onerror="this.style.display='none'"/></div>
        <div><div class="brand-name">YouChef</div><div class="brand-sub">Recipe Card</div></div>
      </div>
      <div class="header-badge">
        <div class="badge-tag">Category</div>
        <div class="badge-cat">${meal.strCategory || "Recipe"}</div>
      </div>
    </div>
    <div class="meal-hero">
      <img class="meal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" onerror="this.style.background='#eef0fb'"/>
      <div class="meal-info">
        <div class="meal-title">${meal.strMeal}</div>
        <div class="meal-meta">
          ${meal.strArea ? `<span class="meta-pill">🌍 ${meal.strArea}</span>` : ""}
          ${meal.strCategory ? `<span class="meta-pill">🍽 ${meal.strCategory}</span>` : ""}
          ${meal.strTags ? meal.strTags.split(",").slice(0,2).map(t => `<span class="meta-pill">${t.trim()}</span>`).join("") : ""}
        </div>
      </div>
    </div>
  </div>
  <div class="nutrition-bar">
    ${[
      { label: "Calories", val: cal, unit: "kcal" },
      { label: "Protein", val: protein, unit: "g" },
      { label: "Carbs", val: carbs, unit: "g" },
      { label: "Fat", val: fat, unit: "g" },
    ].map(n => `<div class="nut-item"><div class="nut-val">${n.val}<span style="font-size:12px;font-weight:400;color:#BBC8D8"> ${n.unit}</span></div><div class="nut-label">${n.label}</div></div>`).join("")}
  </div>
  <div class="content">
    <div class="left-col">
      <div class="section-title">Ingredients</div>
      ${ingredients.map(({ ingredient, measure }) => `
        <div class="ing-row">
          <img class="ing-img" src="https://www.themealdb.com/images/ingredients/${ingredient}-small.png" alt="${ingredient}" onerror="this.style.display='none'"/>
          <span class="ing-name">${ingredient}</span>
          <span class="ing-measure">${measure || ""}</span>
        </div>
      `).join("")}
    </div>
    <div class="right-col">
      <div class="section-title">Instructions</div>
      <div class="instructions">${(meal.strInstructions || "").slice(0, 1200)}${meal.strInstructions?.length > 1200 ? "..." : ""}</div>
    </div>
  </div>
  <div class="tear"><div class="tear-line"></div></div>
  <div class="footer">
    <div class="footer-left">Generated by YouChef AI · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
    <div class="footer-right">youchef.kz</div>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
}

// ─── Copy recipe as text ──────────────────────────────────────────────────────
function copyMealAsText(meal, ingredients, nutrition) {
  const lines = [
    `🍽 ${meal.strMeal}`,
    `📍 ${meal.strArea || ""} · ${meal.strCategory || ""}`,
    "",
    `📊 Nutrition (per serving):`,
    `  Calories: ${nutrition?.calories || "—"} kcal`,
    `  Protein:  ${nutrition?.protein || "—"}g`,
    `  Carbs:    ${nutrition?.carbs || "—"}g`,
    `  Fat:      ${nutrition?.fat || "—"}g`,
    "",
    `🧂 Ingredients:`,
    ...ingredients.map(i => `  • ${i.ingredient}  ${i.measure}`),
    "",
    `📝 Instructions:`,
    meal.strInstructions || "",
    "",
    `— Generated by YouChef · youchef.kz`,
  ];
  navigator.clipboard.writeText(lines.join("\n"));
}

// ─── Cooking Timer Modal ──────────────────────────────────────────────────────
function CookingTimerModal({ onClose }) {
  const [tab, setTab] = useState("timer");

  // Timer state
  const [timerTotal, setTimerTotal] = useState(300);
  const [timerLeft, setTimerLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [tH, setTH] = useState(0);
  const [tM, setTM] = useState(5);
  const [tS, setTS] = useState(0);
  const timerRef = useRef(null);

  // Stopwatch state
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const swRef = useRef(null);
  const swStartRef = useRef(0);
  const lapBaseRef = useRef(0);

  // Multi timer state
  const [multiTimers, setMultiTimers] = useState([]);
  const multiRefs = useRef({});

  const CIRC = 427;

  const pad = (n) => String(Math.floor(n)).padStart(2, "0");
  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  };
  const swFmt = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), t = Math.floor((ms % 1000) / 100);
    return `${pad(m)}:${pad(s)}.${t}`;
  };

  const beep = (freq = 880) => {
    try {
      const a = new AudioContext();
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.3, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.8);
      o.start(); o.stop(a.currentTime + 0.8);
    } catch (e) {}
  };

  // Timer handlers
  const setPreset = (mins) => {
    clearInterval(timerRef.current);
    setTimerRunning(false); setTimerDone(false);
    const total = mins * 60;
    setTimerTotal(total); setTimerLeft(total);
    setTH(0); setTM(mins); setTS(0);
  };

  const handleInputChange = (h, m, s) => {
    const total = h * 3600 + m * 60 + s;
    setTimerTotal(total); setTimerLeft(total);
    setTimerDone(false); setTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const toggleTimer = () => {
    if (timerDone) { setTimerLeft(timerTotal); setTimerDone(false); return; }
    if (timerRunning) {
      clearInterval(timerRef.current); setTimerRunning(false);
    } else {
      if (timerLeft === 0) return;
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false); setTimerDone(true);
            beep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false); setTimerDone(false);
    setTimerLeft(timerTotal);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Stopwatch handlers
  const toggleSW = () => {
    if (swRunning) {
      clearInterval(swRef.current); setSwRunning(false);
    } else {
      swStartRef.current = Date.now() - swElapsed;
      setSwRunning(true);
      swRef.current = setInterval(() => setSwElapsed(Date.now() - swStartRef.current), 100);
    }
  };

  const lapSW = () => {
    const lapTime = swElapsed - lapBaseRef.current;
    lapBaseRef.current = swElapsed;
    setLaps(prev => [{ n: prev.length + 1, t: lapTime }, ...prev]);
  };

  const resetSW = () => {
    clearInterval(swRef.current);
    setSwRunning(false); setSwElapsed(0);
    setLaps([]); lapBaseRef.current = 0;
  };

  useEffect(() => () => clearInterval(swRef.current), []);

  // Multi timer handlers
  const addMultiTimer = (name = "Этап", mins = 5) => {
    const id = Date.now();
    setMultiTimers(prev => [...prev, { id, name, total: mins * 60, left: mins * 60, running: false, done: false }]);
  };

  const toggleMulti = (id) => {
    setMultiTimers(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.done) {
        clearInterval(multiRefs.current[id]);
        return { ...t, left: t.total, done: false, running: false };
      }
      if (t.running) {
        clearInterval(multiRefs.current[id]);
        return { ...t, running: false };
      }
      multiRefs.current[id] = setInterval(() => {
        setMultiTimers(p => p.map(mt => {
          if (mt.id !== id) return mt;
          if (mt.left <= 1) {
            clearInterval(multiRefs.current[id]);
            beep(660);
            return { ...mt, left: 0, running: false, done: true };
          }
          return { ...mt, left: mt.left - 1 };
        }));
      }, 1000);
      return { ...t, running: true };
    }));
  };

  const removeMulti = (id) => {
    clearInterval(multiRefs.current[id]);
    setMultiTimers(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => () => Object.values(multiRefs.current).forEach(clearInterval), []);

  const ringOffset = timerTotal > 0 ? CIRC * (1 - timerLeft / timerTotal) : 0;

  const tabStyle = (active) => ({
    flex: 1, padding: "8px", border: "0.5px solid #BBC8D8", borderRadius: 8,
    background: active ? "#242D96" : "transparent", cursor: "pointer", fontSize: 14,
    color: active ? "white" : "#788CA5", fontFamily: "Teachers, sans-serif",
  });

  const btnStyle = (primary, danger) => ({
    padding: "10px 24px", borderRadius: 24, cursor: "pointer",
    fontFamily: "Teachers, sans-serif", fontSize: 14,
    border: primary || danger ? "none" : "0.5px solid #BBC8D8",
    background: danger ? "#E24B4A" : primary ? "#242D96" : "transparent",
    color: primary || danger ? "white" : "#333",
  });

  const presets = [1, 3, 5, 10, 15, 30];
  const multiPresets = [
    { name: "Варка яиц", mins: 7 },
    { name: "Кипячение", mins: 10 },
    { name: "Выпечка", mins: 25 },
    { name: "Маринование", mins: 30 },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "20px 20px 40px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#242D96", fontFamily: "Teachers, sans-serif" }}>Таймер повара</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#788CA5", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button style={tabStyle(tab === "timer")} onClick={() => setTab("timer")}>Таймер</button>
          <button style={tabStyle(tab === "stopwatch")} onClick={() => setTab("stopwatch")}>Секундомер</button>
          <button style={tabStyle(tab === "multi")} onClick={() => setTab("multi")}>Мультитаймер</button>
        </div>

        {/* ── TIMER ── */}
        {tab === "timer" && (
          <div>
            {timerDone && (
              <div style={{ textAlign: "center", padding: "10px", background: "#FEE2E2", borderRadius: 10, color: "#E24B4A", fontSize: 14, marginBottom: 16, fontFamily: "Teachers, sans-serif" }}>
                Время вышло!
              </div>
            )}

            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 16px" }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="80" cy="80" r="68" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="80" cy="80" r="68" fill="none"
                  stroke={timerDone ? "#E24B4A" : "#242D96"} strokeWidth="8"
                  strokeDasharray={CIRC} strokeDashoffset={ringOffset}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 500, color: timerDone ? "#E24B4A" : timerRunning ? "#242D96" : "#333", fontVariantNumeric: "tabular-nums", fontFamily: "Teachers, sans-serif" }}>
                  {fmt(timerLeft)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {presets.map(m => (
                <button key={m} onClick={() => setPreset(m)}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "0.5px solid #BBC8D8", background: "transparent", cursor: "pointer", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
                  {m} мин
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
              {[
                { label: "часы", val: tH, set: (v) => { setTH(v); handleInputChange(v, tM, tS); } },
                { label: "мин",  val: tM, set: (v) => { setTM(v); handleInputChange(tH, v, tS); } },
                { label: "сек",  val: tS, set: (v) => { setTS(v); handleInputChange(tH, tM, v); } },
              ].map(({ label, val, set }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <label style={{ fontSize: 12, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>{label}</label>
                  <input
                    type="number" min="0" max="59" value={val}
                    onChange={e => set(Number(e.target.value) || 0)}
                    style={{ width: 64, textAlign: "center", fontSize: 20, border: "0.5px solid #BBC8D8", borderRadius: 8, background: "#f8f9ff", color: "#242D96", padding: "6px 4px", fontFamily: "Teachers, sans-serif" }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button style={btnStyle(true)} onClick={toggleTimer}>
                {timerDone ? "Сброс" : timerRunning ? "Пауза" : "Старт"}
              </button>
              <button style={btnStyle(false)} onClick={resetTimer}>Сброс</button>
            </div>
          </div>
        )}

        {/* ── STOPWATCH ── */}
        {tab === "stopwatch" && (
          <div>
            <div style={{ textAlign: "center", padding: "1.5rem 0 1rem" }}>
              <div style={{ fontSize: 52, fontWeight: 500, color: swRunning ? "#242D96" : "#333", fontVariantNumeric: "tabular-nums", fontFamily: "Teachers, sans-serif", lineHeight: 1 }}>
                {swFmt(swElapsed)}
              </div>
              <div style={{ fontSize: 13, color: "#788CA5", marginTop: 8, fontFamily: "Teachers, sans-serif" }}>
                {swRunning ? "идёт..." : swElapsed > 0 ? "на паузе" : "готов"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
              <button style={btnStyle(true)} onClick={toggleSW}>{swRunning ? "Пауза" : "Старт"}</button>
              <button
                style={{ ...btnStyle(false), opacity: swRunning ? 1 : 0.4, cursor: swRunning ? "pointer" : "default" }}
                onClick={swRunning ? lapSW : undefined}
              >
                Круг
              </button>
              <button style={btnStyle(false)} onClick={resetSW}>Сброс</button>
            </div>

            {laps.length > 0 && (
              <div style={{ maxHeight: 160, overflowY: "auto", borderTop: "0.5px solid #e5e7eb" }}>
                {laps.map(l => (
                  <div key={l.n} style={{ display: "flex", justifyContent: "space-between", padding: "7px 4px", borderBottom: "0.5px solid #f3f4f6", fontSize: 13, fontFamily: "Teachers, sans-serif" }}>
                    <span style={{ color: "#788CA5" }}>Круг {l.n}</span>
                    <span style={{ color: "#242D96", fontVariantNumeric: "tabular-nums" }}>{swFmt(l.t)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MULTI TIMER ── */}
        {tab === "multi" && (
          <div>
            {multiTimers.length === 0 && (
              <div style={{ textAlign: "center", color: "#788CA5", fontSize: 13, padding: "1rem 0", fontFamily: "Teachers, sans-serif" }}>
                Добавьте этапы приготовления
              </div>
            )}

            {multiTimers.map(t => {
              const pct = t.total > 0 ? ((1 - t.left / t.total) * 100).toFixed(1) : 0;
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "0.5px solid #e5e7eb", borderRadius: 10, marginBottom: 8, background: "white" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#242D96", fontFamily: "Teachers, sans-serif", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.name}
                    </div>
                    <div style={{ height: 3, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: t.done ? "#E24B4A" : "#242D96", transition: "width 0.9s linear" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, minWidth: 52, textAlign: "right", fontVariantNumeric: "tabular-nums", color: t.done ? "#E24B4A" : t.running ? "#242D96" : "#333", fontFamily: "Teachers, sans-serif" }}>
                    {fmt(t.left)}
                  </div>
                  <button onClick={() => toggleMulti(t.id)}
                    style={{ padding: "6px 12px", borderRadius: 20, border: "0.5px solid #242D96", background: t.running ? "transparent" : "#242D96", color: t.running ? "#242D96" : "white", fontSize: 12, cursor: "pointer", fontFamily: "Teachers, sans-serif" }}>
                    {t.done ? "Сброс" : t.running ? "Пауза" : "Старт"}
                  </button>
                  <button onClick={() => removeMulti(t.id)}
                    style={{ padding: "6px 10px", borderRadius: 20, border: "0.5px solid #BBC8D8", background: "transparent", color: "#788CA5", fontSize: 12, cursor: "pointer" }}>
                    ✕
                  </button>
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {multiPresets.map(p => (
                <button key={p.name} onClick={() => addMultiTimer(p.name, p.mins)}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "0.5px solid #BBC8D8", background: "transparent", cursor: "pointer", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
                  {p.name}
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button style={btnStyle(true)} onClick={() => addMultiTimer()}>+ Добавить этап</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MealPage ─────────────────────────────────────────────────────────────────
function MealPage() {
  const { id } = useParams();
  const userContext = useUser();

  const [nutrition, setNutrition] = useState(null);
  const [freeKbjuViewsUsed, setFreeKbjuViewsUsed] = useState(0);
  const [freeKbjuLimit, setFreeKbjuLimit] = useState(10);
  const [limitReached, setLimitReached] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [videoId, setVideoId] = useState(null);

  const nutritionFetchedRef = useRef(false);

  useEffect(() => {
    nutritionFetchedRef.current = false;
    setNutrition(null);
    setNutritionLoading(true);
    setLimitReached(false);
    setShowUpgradeModal(false);
  }, [id]);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/user/data`, { method: "GET" })
      .then(res => res.json())
      .then(data => { if (data.success) setIsPremium(Boolean(data.userData?.premium)); })
      .catch(() => {})
      .finally(() => setUserLoaded(true));
  }, []);

  const ingredients = useMemo(() => {
    const list = [];
    if (meal) {
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          list.push({ ingredient, measure });
        }
      }
    }
    return list;
  }, [meal]);

  useEffect(() => {
    if (!meal || ingredients.length === 0 || !userLoaded) return;
    if (nutritionFetchedRef.current) return;
    nutritionFetchedRef.current = true;

    const fetchNutrition = async () => {
      setNutritionLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/nutrition/${meal.idMeal}`, {
          method: "POST",
          body: JSON.stringify({ ingredients, mealName: meal.strMeal, instructions: meal.strInstructions }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403 && data.limitReached) {
            setLimitReached(true);
            setFreeKbjuViewsUsed(data.freeKbjuViewsUsed ?? 10);
            setFreeKbjuLimit(data.freeKbjuLimit ?? 10);
            setNutrition(null);
            const lastShown = localStorage.getItem("upgrade_modal_shown");
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (!lastShown || Number(lastShown) < weekAgo) {
              localStorage.setItem("upgrade_modal_shown", Date.now().toString());
              setShowUpgradeModal(true);
            }
            return;
          }
          throw new Error("Failed to fetch nutrition");
        }
        const used = data.freeKbjuViewsUsed ?? 0;
        const limit = data.freeKbjuLimit ?? 10;
        setLimitReached(false);
        setFreeKbjuViewsUsed(used);
        setFreeKbjuLimit(limit);
        setNutrition(data);
        if (!data.premium && used >= limit) {
          const lastShown = localStorage.getItem("upgrade_modal_shown");
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (!lastShown || Number(lastShown) < weekAgo) {
            localStorage.setItem("upgrade_modal_shown", Date.now().toString());
            setShowUpgradeModal(true);
          }
        }
      } catch (err) {
        console.error(err);
        setLimitReached(false);
        setNutrition(null);
      } finally {
        setNutritionLoading(false);
      }
    };
    fetchNutrition();
  }, [meal, ingredients, userLoaded]);

  useEffect(() => {
    const loadMeal = async () => {
      setLoading(true);
      try {
        const localMeal = (hybridMeals.meals || []).find(m => m.idMeal === id);
        if (localMeal) {
          setMeal(localMeal);
          if (localMeal.strYoutube) setVideoId(localMeal.strYoutube.split("v=")[1]);
          apiFetch(`${API_BASE_URL}/api/user/history/meal`, {
            method: "POST",
            body: JSON.stringify({ idMeal: localMeal.idMeal, strMeal: localMeal.strMeal, strMealThumb: localMeal.strMealThumb, strCategory: localMeal.strCategory }),
          }).catch(() => {});
          setLoading(false);
          return;
        }
        const mealRes = await fetch(`https://www.themealdb.com/api/json/v2/65232507/lookup.php?i=${id}`);
        const mealData = await mealRes.json();
        const currentMeal = mealData.meals?.[0] || null;
        setMeal(currentMeal);
        if (currentMeal?.strYoutube) setVideoId(currentMeal.strYoutube.split("v=")[1]);
        if (currentMeal) {
          apiFetch(`${API_BASE_URL}/api/user/history/meal`, {
            method: "POST",
            body: JSON.stringify({ idMeal: currentMeal.idMeal, strMeal: currentMeal.strMeal, strMealThumb: currentMeal.strMealThumb, strCategory: currentMeal.strCategory }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMeal();
  }, [id]);

  const toggleFavorite = () => {
    if (!meal) return;
    const isAlready = favorites.find(f => f.idMeal === meal.idMeal);
    const updated = isAlready ? favorites.filter(f => f.idMeal !== meal.idMeal) : [...favorites, meal];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleCopy = () => {
    copyMealAsText(meal, ingredients, nutrition);
    setCopied(true); setShowShareMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = () => {
    downloadMealAsPDF(meal, ingredients, nutrition);
    setShowShareMenu(false);
  };

  if (loading || !userLoaded) {
    return <div className="loaderContainer"><div className="loader"></div></div>;
  }

  if (!meal) return <div>Meal not found</div>;

  const isFavorite = favorites.some(f => f.idMeal === meal.idMeal);
  const remainingViews = Math.max(0, freeKbjuLimit - freeKbjuViewsUsed);
  const shouldBlurNutrition = limitReached && !isPremium;
  const shownNutrition = shouldBlurNutrition
    ? { calories: "•••", carbs: "•••", protein: "•••", fat: "•••" }
    : nutrition;
  const counterColor = remainingViews <= 2 ? "#FF786D" : remainingViews <= 5 ? "#ED8B07" : "#029663";

  return (
    <div className="mealPage">

      {/* COOKING TIMER MODAL */}
      {showTimer && <CookingTimerModal onClose={() => setShowTimer(false)} />}

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 380, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "#242D96", padding: "28px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💎</div>
              <h2 style={{ color: "white", fontSize: 20, fontWeight: 500, margin: "0 0 6px", fontFamily: "Teachers, sans-serif" }}>Upgrade to Premium</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0, fontFamily: "Teachers, sans-serif" }}>
                {limitReached ? "You've used all your free AI calorie calculations." : `Only ${remainingViews} free views left.`}
              </p>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {["Unlimited AI calorie calculations", "Access to exclusive recipes", "Weekly meal planner", "Food photo analysis"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6FAED", display: "flex", alignItems: "center", justifyContent: "center", color: "#029663", fontSize: 11, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#555", fontFamily: "Teachers, sans-serif" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowUpgradeModal(false); navigate("/premium"); }}
                style={{ width: "100%", padding: "10px", borderRadius: 50, background: "#242D96", color: "white", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "Teachers, sans-serif", marginBottom: 8 }}>
                Get Premium →
              </button>
              <button onClick={() => setShowUpgradeModal(false)}
                style={{ width: "100%", padding: "10px", borderRadius: 50, background: "transparent", color: "#aaa", fontSize: 14, border: "1px solid #BBC8D8", cursor: "pointer", fontFamily: "Teachers, sans-serif" }}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE DROPDOWN OVERLAY */}
      {showShareMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowShareMenu(false)} />
      )}

      <div className="headerBegin">
        <button className="backBtn" onClick={() => navigate(-1)}>Back</button>
        <button className="backIconMobile" onClick={() => navigate(-1)} aria-label="Back">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <div className="nameFoodTitle">{meal.strMeal}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Timer button */}
          <button
            onClick={() => setShowTimer(true)}
            style={{
              background: "white", border: "1.5px solid #242D96", borderRadius: 50,
              padding: "10px 16px", cursor: "pointer", fontFamily: "Teachers, sans-serif",
              fontSize: 14, color: "#242D96", display: "flex", alignItems: "center", gap: 6, height: 40,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="2">
              <circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3"/><path d="M9 3h6"/><path d="M12 3v2"/>
            </svg>
            Таймер
          </button>

          {/* Share button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowShareMenu(v => !v)}
              style={{
                background: "#242D96", border: "none", borderRadius: 50,
                padding: "10px 20px", cursor: "pointer", fontFamily: "Teachers, sans-serif",
                fontSize: 14, color: "white", display: "flex", alignItems: "center", gap: 6, height: 40,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
            {showShareMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid #e8ecf8", zIndex: 999, minWidth: 180, overflow: "hidden",
              }}>
                <button onClick={handleCopy}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "Teachers, sans-serif", fontSize: 14, color: "#242D96", textAlign: "left" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy recipe
                </button>
                <div style={{ height: 1, background: "#f3f4f6" }} />
                <button onClick={handlePDF}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "Teachers, sans-serif", fontSize: 14, color: "#242D96", textAlign: "left" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </button>
              </div>
            )}
          </div>

          <div className="favoriteIcon" onClick={toggleFavorite}>
            <img src={blueFav} alt="favorite" style={{ opacity: isFavorite ? 1 : 0.4 }} />
          </div>
        </div>
      </div>

      <div className="imgWrapper">
        <img src={line} alt="" />
      </div>

      <div className="infoWrapper">
        <div className="youtubeLink">
          <img src={youtubeLogo} alt="YouTube" />
          <div className="youtubeText">
            <div>There is a video on YouTube link</div>
            {meal.strYoutube && (
              <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="youtubeRecipeLink">
                How to cook this {meal.strMeal}
              </a>
            )}
          </div>
        </div>
        <div className="calculationWrapper">
          <div className="topCalc">
            <img className="caloriesCalculator" src={Calculator} alt="Calories calculator" />
            <div className="calcInfos">
              <div className={`nutritionRow ${shouldBlurNutrition ? "nutritionBlurred" : ""}`}>
                {["calories", "carbs", "protein", "fat"].map((key, i) => (
                  <div key={key} className="nutritionItem">
                    <div className="nutritionValue">
                      {nutritionLoading ? "..." : shownNutrition ? shownNutrition[key] : "—"}
                    </div>
                    <div className="nutritionLabel">
                      {["Calories", "Carbs", "Protein", "Fat"][i]}
                    </div>
                  </div>
                ))}
              </div>
              {shouldBlurNutrition && (
                <div className="nutritionLockNotice">Upgrade to Premium to unlock nutrition info.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isPremium && !nutritionLoading && (
        <div className="limitWrapper">
          <div className="img"><img src={warn} alt="" /></div>
          <div style={{ color: counterColor }}>
            {limitReached ? "Free limit reached" : "Free views left"}
          </div>
          <div className="limitText">
            {limitReached
              ? `You used all ${freeKbjuLimit}/${freeKbjuLimit} AI calorie calculations`
              : `${remainingViews}/${freeKbjuLimit} free AI calorie calculations remaining`}
          </div>
          <button className="upgrade premiumCtaBtn" onClick={() => setShowUpgradeModal(true)}>
            {limitReached ? "Upgrade Premium" : "Upgrade"}
          </button>
        </div>
      )}

      <div className="mainContent">
        <div className="firstRow">
          <div className="image">
            <img src={meal.strMealThumb} alt={meal.strMeal} />
          </div>
          <div className="ingredientsList">
            <div className="ingredientsTitle">Ingredients</div>
            <div className="ingredientsContainer">
              {ingredients.map((item, index) => (
                <div key={index} className="ingredientRow">
                  <li className="ingredientName">{item.ingredient + " "}</li>
                  <span className="ingredientMeasure">{" " + item.measure}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="secondRow">{meal.strInstructions}</div>
      </div>

      {videoId && (
        <div style={{ maxWidth: 800, margin: "60px auto 0", padding: "0 16px" }}>
          <h2 style={{ color: "#242D96", fontFamily: "Taviraj", fontSize: 28, fontWeight: 500, marginBottom: 20, textAlign: "center" }}>
            How to cook this {meal.strMeal}
          </h2>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            {!playerPlaying ? (
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setPlayerPlaying(true)}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt="Video preview"
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#242D96"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.7)", color: "white", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>
                  YouTube
                </div>
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={`How to cook ${meal.strMeal}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
              />
            )}
          </div>
          <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginTop: 10, fontFamily: "Teachers, sans-serif" }}>
            Click play to watch the full recipe video
          </p>
        </div>
      )}

      <div className="lineWrapper">
        <div className="centerLine"></div>
      </div>

      <div className="searchingQuestion">Don't see what you're looking for?</div>

      <div className="expandTitle">
        YouChef is always looking to expand their recipes catalogue. Request a recipe and we'll do our best to help
      </div>

      <button className="requestRecipe" onClick={() => navigate("/request-recipe")}>
        Request Recipe
      </button>
    </div>
  );
}

export default MealPage;