import { useState, useEffect, useRef } from "react";
import API_BASE_URL, { apiFetch } from "../config/api";
import { useNavigate } from "react-router-dom";

// ─── PDF Download ────────────────────────────────────────────────────────────
function downloadPlanAsPDF(planData) {
  const { plan, total_daily_calories, notes } = planData;
  const dayColors = ["#EEF0FB","#F0F7FF","#F5F0FF","#F0FFF4","#FFFBF0","#FFF0F0","#F0FBFF"];
  const mealIcons = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
  const rows = plan.map((day, i) => `
    <div class="day-card" style="background:${dayColors[i % dayColors.length]}">
      <div class="day-header">
        <div class="day-title">${day.day}</div>
        <div class="day-total">${["breakfast","lunch","dinner"].reduce((s,m)=>s+(day[m]?.calories||0),0)} kcal</div>
      </div>
      ${["breakfast","lunch","dinner"].map(m => `
        <div class="meal-row">
          <span class="meal-icon">${mealIcons[m]}</span>
          <span class="meal-label">${m.charAt(0).toUpperCase()+m.slice(1)}</span>
          <span class="meal-name">${day[m]?.name || "—"}</span>
          <span class="meal-cal">${day[m]?.calories ?? "—"} kcal</span>
        </div>
      `).join("")}
    </div>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>Meal Plan — YouChef</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Teachers:wght@400;500;600;700&family=Taviraj:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Teachers',sans-serif;background:#FDFBE7;color:#1a1a2e}
  .page{max-width:780px;margin:0 auto;background:white;min-height:100vh}
  .header{background:#242D96;padding:36px 48px 32px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden}
  .header::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.05)}
  .header-left{display:flex;align-items:center;gap:16px}
  .logo-wrap{width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;overflow:hidden}
  .logo-wrap img{width:44px;height:44px;object-fit:contain}
  .brand{font-family:'Taviraj',serif;font-size:28px;font-weight:500;color:white}
  .brand-sub{font-size:13px;color:rgba(255,255,255,0.55);margin-top:2px}
  .header-badge{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:10px 18px;text-align:center}
  .badge-num{font-size:24px;font-weight:700;color:white}
  .badge-label{font-size:11px;color:rgba(255,255,255,0.55);margin-top:2px;text-transform:uppercase;letter-spacing:1px}
  .meta-bar{background:#f8f9ff;border-bottom:1px solid #eef0fb;padding:18px 48px;display:flex;gap:24px;flex-wrap:wrap}
  .meta-item{display:flex;align-items:flex-start;gap:10px;max-width:320px}
  .meta-dot{width:8px;height:8px;border-radius:50%;background:#242D96;flex-shrink:0;margin-top:5px}
  .meta-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block}
  .meta-value{font-size:13px;font-weight:500;color:#242D96;word-break:break-word;line-height:1.5}
  .content{padding:28px 48px 48px}
  .section-title{font-family:'Taviraj',serif;font-size:20px;font-weight:500;color:#242D96;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #EEF0FB;display:flex;align-items:center;gap:10px}
  .days-grid{display:grid;grid-template-columns:1fr;gap:12px}
  .day-card{border-radius:14px;padding:16px 18px;break-inside:avoid}
  .day-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(36,45,150,0.1)}
  .day-title{font-size:14px;font-weight:700;color:#242D96}
  .day-total{font-size:11px;color:#888;background:white;border-radius:20px;padding:2px 8px}
  .meal-row{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px}
  .meal-icon{font-size:12px;flex-shrink:0}
  .meal-label{width:62px;color:#888;font-weight:600;flex-shrink:0}
  .meal-name{flex:1;color:#2d2d2d;min-width:0;word-break:break-word;white-space:normal;line-height:1.4}
  .meal-cal{color:#242D96;font-weight:700;white-space:nowrap;font-size:11px;flex-shrink:0;padding-left:6px}
  .footer{background:#242D96;padding:20px 48px;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{color:rgba(255,255,255,0.7);font-size:13px}
  .footer-url{color:rgba(255,255,255,0.4);font-size:12px}
  .ticket-line{display:flex;align-items:center;margin:24px 0}
  .ticket-notch{width:20px;height:20px;border-radius:50%;background:#FDFBE7;flex-shrink:0}
  .ticket-dash{flex:1;border-top:2px dashed #BBC8D8}
  @media print{body{background:white}.days-grid{grid-template-columns:1fr 1fr}.day-card{break-inside:avoid}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <div class="logo-wrap"><img src="https://youchef.kz/icons/logo-192.png" alt="YouChef" onerror="this.style.display='none'"/></div>
      <div><div class="brand">YouChef</div><div class="brand-sub">AI-Generated Meal Plan</div></div>
    </div>
    <div class="header-badge"><div class="badge-num">~${total_daily_calories}</div><div class="badge-label">kcal / day</div></div>
  </div>
  <div class="meta-bar">
    <div class="meta-item"><div class="meta-dot"></div><div><span class="meta-label">Duration</span><span class="meta-value">${plan.length} days</span></div></div>
    <div class="meta-item"><div class="meta-dot" style="background:#029663"></div><div><span class="meta-label">Preferences</span><span class="meta-value" style="color:#029663">${notes || "Balanced diet"}</span></div></div>
    <div class="meta-item" style="margin-left:auto"><div><span class="meta-label">Generated</span><span class="meta-value">${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span></div></div>
  </div>
  <div class="content">
    <div class="section-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#242D96" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Schedule</div>
    <div class="days-grid">${rows}</div>
    <div class="ticket-line"><div class="ticket-notch"></div><div class="ticket-dash"></div><div class="ticket-notch"></div></div>
    <div style="background:#EEF0FB;border-radius:14px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:13px;color:#242D96;font-weight:600;">Total calories (${plan.length} days)</div>
      <div style="font-size:20px;font-weight:700;color:#242D96;">~${total_daily_calories * plan.length} kcal</div>
    </div>
  </div>
  <div class="footer"><div class="footer-brand">Generated by YouChef AI</div><div class="footer-url">youchef.kz</div></div>
</div></body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 800);
}

function copyPlanAsText(planData) {
  const lines = [`🍽 YouChef — Meal Plan`, `~${planData.total_daily_calories} kcal/day`, ``];
  planData.plan.forEach(day => {
    lines.push(`📅 ${day.day}`);
    ["breakfast","lunch","dinner"].forEach(m => {
      lines.push(`  ${m.charAt(0).toUpperCase()+m.slice(1)}: ${day[m]?.name || "—"} (${day[m]?.calories ?? "—"} kcal)`);
    });
    lines.push("");
  });
  lines.push(`Notes: ${planData.notes || "—"}`);
  navigator.clipboard.writeText(lines.join("\n"));
}

function AnimatedPlanResult({ result, onNewPlan, onClose }) {
  const [visibleDays, setVisibleDays] = useState(0);

  useEffect(() => {
    if (visibleDays < result.data.plan.length) {
      const t = setTimeout(() => setVisibleDays(v => v + 1), 450);
      return () => clearTimeout(t);
    }
  }, [visibleDays, result.data.plan.length]);

  const isComplete = visibleDays >= result.data.plan.length;

  return (
    <div>
      <style>{`
        @keyframes fadeSlideIn{0%{opacity:0;transform:translateY(16px) scale(0.97)}60%{opacity:.8;transform:translateY(-2px) scale(1.005)}100%{opacity:1;transform:translateY(0) scale(1)}}
        .day-appear{animation:fadeSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
        .typing-dot{animation:wave 1.1s ease infinite;display:inline-block;width:7px;height:7px;border-radius:50%;background:#242D96;margin:0 3px}
        .typing-dot:nth-child(2){animation-delay:.18s;background:#4a57c4}
        .typing-dot:nth-child(3){animation-delay:.36s;background:#7a85d8}
      `}</style>

      <p className="text-gray-500 text-[13px] text-center mb-4 font-['Teachers']">
        ~{result.data.total_daily_calories} kcal/day · {result.data.notes}
      </p>

      <div className="flex flex-col gap-2.5 mb-4">
        {result.data.plan.slice(0, visibleDays).map((day) => (
          <div key={day.day} className="day-appear border border-[#BBC8D8] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-[#242D96] text-[14px] font-['Teachers']">{day.day}</div>
              <div className="text-[11px] text-gray-400 font-['Teachers']">
                {["breakfast","lunch","dinner"].reduce((s,m)=>s+(day[m]?.calories||0),0)} kcal
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {["breakfast","lunch","dinner"].map(meal => (
                <div key={meal} className="flex justify-between text-[13px] gap-2">
                  <span className="text-gray-400 capitalize w-[70px] flex-shrink-0 font-['Teachers']">{meal}</span>
                  <span className="text-gray-700 flex-1 font-['Teachers']">{day[meal]?.name}</span>
                  <span className="text-[#242D96] font-medium font-['Teachers']">{day[meal]?.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!isComplete && (
          <div className="flex items-center justify-center gap-1 py-3">
            <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <button onClick={() => copyPlanAsText(result.data)} className="flex-1 py-2.5 rounded-full border border-[#242D96] text-[#242D96] text-[13px] font-medium bg-transparent cursor-pointer font-['Teachers'] flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </button>
            <button onClick={() => downloadPlanAsPDF(result.data)} className="flex-1 py-2.5 rounded-full border border-[#242D96] text-[#242D96] text-[13px] font-medium bg-transparent cursor-pointer font-['Teachers'] flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PDF
            </button>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onNewPlan} className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">New plan</button>
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-[14px] border-none cursor-pointer font-['Teachers']">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceTextarea({ value, onChange, placeholder, hasError }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) setSupported(true);
  }, []);

  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "ru-RU";
    let final = value;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += (final ? " " : "") + e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      onChange(final + (interim ? " " + interim : ""));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recognitionRef.current = r;
    setListening(true);
  };

  return (
    <div style={{ position: "relative", marginBottom: 4 }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ boxSizing: "border-box", width: "100%", resize: "vertical", display: "block", paddingRight: supported ? 48 : 16 }}
        className={`min-h-[120px] p-4 rounded-xl border text-[14px] outline-none font-["Teachers"] transition-colors ${hasError ? "border-red-400 bg-red-50" : listening ? "border-[#242D96] bg-[#f8f9ff]" : "border-[#BBC8D8] focus:border-[#242D96]"}`}
      />
      {supported && (
        <button type="button" onClick={toggleListening}
          style={{ position: "absolute", right: 10, bottom: 10, width: 32, height: 32, borderRadius: "50%", background: listening ? "#FF786D" : "#242D96", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: listening ? "0 0 0 4px rgba(255,120,109,0.25)" : "0 2px 8px rgba(36,45,150,0.3)", transition: "all 0.2s" }}>
          {listening ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )}
        </button>
      )}
      {listening && (
        <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", gap: 3, alignItems: "center" }}>
          <style>{`@keyframes bar{0%,100%{height:4px}50%{height:12px}}.vbar{width:3px;border-radius:2px;background:#242D96;animation:bar 0.8s ease infinite}.vbar:nth-child(2){animation-delay:.15s}.vbar:nth-child(3){animation-delay:.3s}.vbar:nth-child(4){animation-delay:.45s}`}</style>
          {[0,1,2,3].map(i => <div key={i} className="vbar"/>)}
          <span style={{ fontSize: 11, color: "#242D96", marginLeft: 4, fontFamily: "Teachers, sans-serif" }}>Listening...</span>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function AIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // ← анимация
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [planText, setPlanText] = useState("");
  const [planError, setPlanError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [limits, setLimits] = useState({ photo: { used: 0, limit: 10 }, plan: { used: 0, limit: 10 }, isPremium: false });

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/user/data`, { method: "GET" })
      .then(res => res.json())
      .then(data => { if (data.success) setUser(data.userData); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!user) return;
    apiFetch(`${API_BASE_URL}/api/ai/limits`)
      .then(res => res.json())
      .then(data => { if (data.success) setLimits(data); })
      .catch(() => {});
  }, [user]);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => setIsAnimating(true), 10);
    setMode(null); setResult(null); setPreviewUrl(null); setPlanText(""); setPlanError("");
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      setMode(null); setResult(null); setPreviewUrl(null); setPlanText(""); setPlanError("");
    }, 400);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(",")[1];
      const mediaType = file.type;
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/ai/analyze-food`, {
          method: "POST",
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });
        const data = await res.json();
        if (data.success) {
          setResult({ type: "photo", data: data.data });
          setLimits(prev => ({ ...prev, photo: { used: data.used, limit: data.limit } }));
          apiFetch(`${API_BASE_URL}/api/user/history/ai`, {
            method: "POST",
            body: JSON.stringify({ type: "photo", query: data.data.dish, result: data.data }),
          }).catch(() => {});
        } else if (data.limitReached) {
          setResult({ type: "limit", mode: "photo" });
        } else {
          setResult({ type: "not_food", message: data.message || "This doesn't look like food. Please try another photo." });
        }
      } catch {
        setResult({ type: "not_food", message: "Something went wrong. Please try again." });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMealPlan = async () => {
    const trimmed = planText.trim();
    if (!trimmed) { setPlanError("Please describe your preferences first."); return; }
    if (trimmed.length < 3) { setPlanError("Please provide more details."); return; }
    setPlanError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/ai/meal-plan`, {
        method: "POST",
        body: JSON.stringify({ preferences: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: "plan", data: data.data });
        setLimits(prev => ({ ...prev, plan: { used: data.used, limit: data.limit } }));
        apiFetch(`${API_BASE_URL}/api/user/history/ai`, {
          method: "POST",
          body: JSON.stringify({ type: "plan", query: trimmed, result: data.data }),
        }).catch(() => {});
      } else if (data.limitReached) {
        setResult({ type: "limit", mode: "plan" });
      } else {
        setResult({ type: "error", message: data.message });
      }
    } catch {
      setResult({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes ripple1{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.4);opacity:0}}
        @keyframes ripple2{0%{transform:scale(1);opacity:.3}100%{transform:scale(3);opacity:0}}
        .ai-ripple1{animation:ripple1 2s ease-out infinite}
        .ai-ripple2{animation:ripple2 2s ease-out infinite .6s}
      `}</style>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[999]">
        <span className="ai-ripple1 absolute inset-0 rounded-full bg-[#242D96]/20"/>
        <span className="ai-ripple2 absolute inset-0 rounded-full bg-[#242D96]/10"/>
        <button
          onClick={() => { if (!user) setShowLoginModal(true); else handleOpen(); }}
          className="ai-assistant-btn relative z-10 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[#242D96] border-none cursor-pointer flex items-center justify-center shadow-[0_6px_24px_rgba(36,45,150,0.45)] hover:scale-105 transition-transform"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C9.5 2 7.5 3.8 7.5 6c0 .4.1.8.2 1.2A4 4 0 0 0 4 11c0 2.2 1.8 4 4 4h8a4 4 0 0 0 4-4 4 4 0 0 0-3.7-3.8c.1-.4.2-.8.2-1.2C16.5 3.8 14.5 2 12 2z"/>
            <path d="M8 15v2a4 4 0 0 0 8 0v-2"/>
            <path d="M9 11h.01M12 11h.01M15 11h.01"/>
          </svg>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-[1000] p-0 sm:p-4"
          style={{
            background: isAnimating ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
            transition: "background 0.4s ease",
            pointerEvents: isAnimating ? "auto" : "none",
          }}
          onClick={handleClose}
        >
          <div
            className="bg-white w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto font-['Teachers']"
            style={{
              transform: isAnimating ? "translateY(0) scale(1)" : "translateY(110%) scale(0.95)",
              opacity: isAnimating ? 1 : 0,
              transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.35s ease",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full"/>
            </div>

            <div className="bg-[#242D96] px-6 pt-5 pb-6 text-center">
              <p className="text-white/60 text-[11px] tracking-[2px] uppercase mb-2 font-['Teachers']">AI Assistant</p>
              <h2 style={{ color: "white" }} className="text-[20px] font-medium mb-1 font-['Teachers']">
                {mode === "photo" ? "Food Analysis" : mode === "plan" ? "Meal Planner" : "What can I help with?"}
              </h2>
              <p className="text-white/70 text-[13px] font-['Teachers']">
                {mode === "photo" ? "Upload a photo to get nutrition info"
                  : mode === "plan" ? "Describe preferences, allergies, days count..."
                  : "Choose one of the options below"}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              {/* ── Limit reached ── */}
              {result?.type === "limit" && (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💎</div>
                  <h3 style={{ color: "#242D96", fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: "Teachers, sans-serif" }}>Free limit reached</h3>
                  <p style={{ color: "#788CA5", fontSize: 13, marginBottom: 20, fontFamily: "Teachers, sans-serif", lineHeight: 1.5 }}>
                    You've used all {limits[result.mode]?.limit} free {result.mode === "photo" ? "photo analyses" : "meal plans"}.<br/>
                    Upgrade to Premium for unlimited access.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {["Unlimited AI photo analysis", "Unlimited meal plan generation", "Unlimited calorie calculations", "Access to exclusive recipes"].map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6FAED", display: "flex", alignItems: "center", justifyContent: "center", color: "#029663", fontSize: 11, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: "#555", fontFamily: "Teachers, sans-serif" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { handleClose(); setTimeout(() => window.location.href = "/premium", 100); }}
                    style={{ width: "100%", padding: "12px", borderRadius: 50, background: "#242D96", color: "white", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "Teachers, sans-serif", marginBottom: 8 }}>
                    Get Premium →
                  </button>
                  <button onClick={() => setResult(null)}
                    style={{ width: "100%", padding: "12px", borderRadius: 50, background: "transparent", color: "#aaa", fontSize: 14, border: "1px solid #BBC8D8", cursor: "pointer", fontFamily: "Teachers, sans-serif" }}>
                    Back
                  </button>
                </div>
              )}

              {/* ── Mode select ── */}
              {!mode && !result && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setMode("photo")} className="flex items-center gap-4 p-4 sm:p-5 border border-[#BBC8D8] rounded-2xl bg-white cursor-pointer text-left hover:border-[#242D96] transition">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF0FB] flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-semibold text-[#242D96] text-[15px] font-['Teachers']">Analyze Food Photo</div>
                      <div className="text-gray-400 text-[13px] mt-0.5 font-['Teachers']">Get calories, protein, carbs & fat</div>
                    </div>
                    {!limits.isPremium && (
                      <div style={{ flexShrink: 0, background: limits.photo.used >= limits.photo.limit ? "#FFF0EE" : "#EEF0FB", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: limits.photo.used >= limits.photo.limit ? "#FF786D" : "#242D96", fontFamily: "Teachers, sans-serif", fontWeight: 600 }}>
                        {limits.photo.limit - limits.photo.used}/{limits.photo.limit}
                      </div>
                    )}
                    {limits.isPremium && (
                      <div style={{ flexShrink: 0, background: "#E6FAED", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#029663", fontFamily: "Teachers, sans-serif", fontWeight: 600 }}>∞</div>
                    )}
                  </button>
                  <button onClick={() => setMode("plan")} className="flex items-center gap-4 p-4 sm:p-5 border border-[#BBC8D8] rounded-2xl bg-white cursor-pointer text-left hover:border-[#242D96] transition">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF0FB] flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h2M8 18h2M14 14h2M14 18h2"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-semibold text-[#242D96] text-[15px] font-['Teachers']">Meal Plan</div>
                      <div className="text-gray-400 text-[13px] mt-0.5 font-['Teachers']">AI creates a personalized plan for you</div>
                    </div>
                    {!limits.isPremium && (
                      <div style={{ flexShrink: 0, background: limits.plan.used >= limits.plan.limit ? "#FFF0EE" : "#EEF0FB", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: limits.plan.used >= limits.plan.limit ? "#FF786D" : "#242D96", fontFamily: "Teachers, sans-serif", fontWeight: 600 }}>
                        {limits.plan.limit - limits.plan.used}/{limits.plan.limit}
                      </div>
                    )}
                    {limits.isPremium && (
                      <div style={{ flexShrink: 0, background: "#E6FAED", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#029663", fontFamily: "Teachers, sans-serif", fontWeight: 600 }}>∞</div>
                    )}
                  </button>
                </div>
              )}

              {/* ── Photo mode ── */}
              {mode === "photo" && !result && (
                <div>
                  {!previewUrl ? (
                    <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-[#BBC8D8] rounded-2xl p-10 text-center cursor-pointer mb-4 hover:border-[#242D96] transition">
                      <div className="text-4xl mb-3">📷</div>
                      <p className="text-[#242D96] font-medium mb-1 font-['Teachers']">Upload food photo</p>
                      <p className="text-gray-400 text-[13px] font-['Teachers']">JPG, PNG up to 5MB</p>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="food" className="w-full max-h-[200px] object-cover rounded-2xl mb-4"/>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                  {loading && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                      <style>{`
                        @keyframes scanLine{0%{top:0;opacity:1}50%{top:calc(100% - 2px);opacity:.7}100%{top:0;opacity:1}}
                        @keyframes photoDotWave{0%,60%,100%{transform:translateY(0) scale(1);opacity:.4}30%{transform:translateY(-9px) scale(1.2);opacity:1}}
                        .photo-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 3px;animation:photoDotWave 1.1s cubic-bezier(.45,0,.55,1) infinite}
                        @keyframes photoTextPulse{0%,100%{opacity:.5}50%{opacity:1}}
                        .photo-text{animation:photoTextPulse 1.8s ease infinite}
                      `}</style>
                      {previewUrl && (
                        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 14, width: "100%" }}>
                          <img src={previewUrl} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block", filter: "brightness(0.7)" }}/>
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ background: "rgba(36,45,150,0.85)", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                              <span style={{ color: "white", fontSize: 13, fontFamily: "Teachers, sans-serif" }}>Analyzing...</span>
                            </div>
                          </div>
                          <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#242D96,transparent)", animation: "scanLine 1.6s ease-in-out infinite", top: 0 }}/>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        {["#242D96","#3d4db8","#5a6acc","#7a85d8","#9aa5e4"].map((bg, i) => (
                          <span key={i} className="photo-dot" style={{ background: bg, animationDelay: `${i*0.15}s` }}/>
                        ))}
                      </div>
                      <p className="photo-text font-['Teachers']" style={{ color: "#242D96", fontSize: 13 }}>Identifying dish and calculating nutrition...</p>
                    </div>
                  )}
                  {!loading && <button onClick={() => setMode(null)} className="w-full py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers'] mt-2">Back</button>}
                </div>
              )}

              {/* ── Not food ── */}
              {result?.type === "not_food" && (
                <div>
                  {previewUrl && (
                    <div className="relative mb-4">
                      <img src={previewUrl} alt="" className="w-full max-h-[160px] object-cover rounded-2xl opacity-50"/>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 rounded-xl px-4 py-2 text-center">
                          <div className="text-2xl mb-1">🚫</div>
                          <p className="text-[13px] font-medium text-gray-700 font-['Teachers']">Not food detected</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4">
                    <p className="text-amber-700 text-[13px] font-['Teachers'] leading-relaxed">{result.message}</p>
                  </div>
                  <button onClick={() => { setResult(null); setPreviewUrl(null); setTimeout(() => fileRef.current?.click(), 50); }} className="w-full py-2.5 rounded-full bg-[#242D96] text-white text-[14px] font-medium border-none cursor-pointer font-['Teachers'] mb-2">📷 Try another photo</button>
                  <button onClick={() => setMode(null)} className="w-full py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">Back</button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                </div>
              )}

              {/* ── Plan mode ── */}
              {mode === "plan" && !result && (
                <div>
                  <VoiceTextarea
                    value={planText}
                    onChange={val => { setPlanText(val); if (planError) setPlanError(""); }}
                    placeholder="Example: 3 days, no pork, lactose free, halal, 1800 kcal / Пример: на 5 дней, без глютена, я мусульманин, бюджетные блюда..."
                    hasError={!!planError}
                  />
                  {planError && <p className="text-red-500 text-[12px] mb-3 font-['Teachers'] leading-relaxed">{planError}</p>}
                  {!planError && <div className="mb-3"/>}
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <style>{`
                        @keyframes dotWave{0%,60%,100%{transform:translateY(0) scale(1);opacity:.4}30%{transform:translateY(-10px) scale(1.15);opacity:1}}
                        .gen-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 4px;animation:dotWave 1.2s cubic-bezier(.45,0,.55,1) infinite}
                        @keyframes textPulse{0%,100%{opacity:.5}50%{opacity:1}}
                        .gen-text{animation:textPulse 1.8s ease infinite}
                      `}</style>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                        {["#242D96","#3d4db8","#5a6acc","#7a85d8","#9aa5e4"].map((bg, i) => (
                          <span key={i} className="gen-dot" style={{ background: bg, animationDelay: `${i*0.15}s` }}/>
                        ))}
                      </div>
                      <p className="gen-text font-['Teachers']" style={{ color: "#242D96", fontSize: 14 }}>Creating your meal plan...</p>
                    </div>
                  ) : (
                    <div className="flex gap-2.5">
                      <button onClick={() => { setMode(null); setPlanError(""); }} className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">Back</button>
                      <button onClick={handleMealPlan} className="flex-[2] py-2.5 rounded-full bg-[#242D96] text-white text-[14px] font-medium border-none cursor-pointer font-['Teachers']">Generate Plan →</button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Photo result ── */}
              {result?.type === "photo" && (
                <div>
                  <style>{`
                    @keyframes resultFadeUp{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
                    @keyframes cardPop{0%{opacity:0;transform:translateY(14px) scale(.93)}65%{transform:translateY(-3px) scale(1.02)}100%{opacity:1;transform:translateY(0) scale(1)}}
                    .result-hero{animation:resultFadeUp .45s cubic-bezier(.22,1,.36,1) forwards}
                    .result-title{animation:resultFadeUp .45s cubic-bezier(.22,1,.36,1) .1s both}
                    .nut-card-0{animation:cardPop .4s cubic-bezier(.22,1,.36,1) .15s both}
                    .nut-card-1{animation:cardPop .4s cubic-bezier(.22,1,.36,1) .23s both}
                    .nut-card-2{animation:cardPop .4s cubic-bezier(.22,1,.36,1) .31s both}
                    .nut-card-3{animation:cardPop .4s cubic-bezier(.22,1,.36,1) .39s both}
                    .result-btns{animation:resultFadeUp .4s cubic-bezier(.22,1,.36,1) .55s both}
                  `}</style>
                  {previewUrl && (
                    <div className="result-hero" style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                      <img src={previewUrl} alt="food" style={{ width: "100%", maxHeight: 150, objectFit: "cover", display: "block" }}/>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(36,45,150,0.5) 0%, transparent 60%)" }}/>
                      <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                        <span style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", borderRadius: 20, padding: "3px 10px", color: "white", fontSize: 11, fontFamily: "Teachers, sans-serif" }}>✓ Analysis complete</span>
                      </div>
                    </div>
                  )}
                  <h3 className="result-title text-[#242D96] text-[18px] font-semibold text-center mb-4 font-['Teachers']">{result.data.dish}</h3>
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      { label: "Calories", value: `${result.data.total_calories} kcal`, sub: `${result.data.calories}/100g`, cls: "nut-card-0" },
                      { label: "Protein",  value: `${result.data.protein}g`, sub: "per 100g", cls: "nut-card-1" },
                      { label: "Carbs",    value: `${result.data.carbs}g`,   sub: "per 100g", cls: "nut-card-2" },
                      { label: "Fat",      value: `${result.data.fat}g`,     sub: "per 100g", cls: "nut-card-3" },
                    ].map(item => (
                      <div key={item.label} className={`${item.cls} bg-[#EEF0FB] rounded-xl p-3.5 text-center`}>
                        <div className="text-gray-400 text-[12px] mb-1 font-['Teachers']">{item.label}</div>
                        <div className="text-[#242D96] font-bold text-[18px] font-['Teachers']">{item.value}</div>
                        <div className="text-gray-300 text-[11px] font-['Teachers']">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-gray-500 text-[12px] mb-1 font-['Teachers']">Portion: {result.data.portion}g</p>
                    <p className="text-gray-500 text-[12px] font-['Teachers']">Confidence: {result.data.confidence}</p>
                  </div>
                  <div className="result-btns flex gap-2.5">
                    <button onClick={() => { setResult(null); setPreviewUrl(null); }} className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">Analyze another</button>
                    <button onClick={handleClose} className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-[14px] border-none cursor-pointer font-['Teachers']">Done</button>
                  </div>
                </div>
              )}

              {result?.type === "plan" && (
                <AnimatedPlanResult result={result} onNewPlan={() => { setResult(null); setPlanText(""); }} onClose={handleClose}/>
              )}

              {result?.type === "error" && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">❌</div>
                  <p className="text-red-500 text-[14px] mb-4 font-['Teachers']">{result.message}</p>
                  <button onClick={() => setResult(null)} className="px-6 py-2.5 rounded-full bg-[#242D96] text-white text-[14px] border-none cursor-pointer font-['Teachers']">Try again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] px-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">🍳</div>
            <h2 className="text-xl font-semibold text-[#242D96] mb-2 font-['Teachers']">Login to use AI</h2>
            <p className="text-gray-500 text-sm mb-6 font-['Teachers']">Sign up or login to access AI food analysis and meal planning</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/login")} className="w-full py-2.5 bg-[#242D96] text-white rounded-full font-medium border-none cursor-pointer font-['Teachers']">Login</button>
              <button onClick={() => navigate("/signup")} className="w-full py-2.5 border border-[#242D96] text-[#242D96] rounded-full font-medium bg-transparent cursor-pointer font-['Teachers']">Sign up</button>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-400 text-sm bg-transparent border-none cursor-pointer font-['Teachers']">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;