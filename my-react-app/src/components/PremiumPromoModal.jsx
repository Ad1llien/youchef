import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "premium_promo_last_shown";
const INTERVAL_DAYS = 3;
const DELAY_MS = 2 * 60 * 1000; // 2 минуты

const BENEFITS = [
  { icon: "🤖", title: "Unlimited AI meal plans", desc: "Generate as many personalized plans as you want" },
  { icon: "📷", title: "Unlimited food photo analysis", desc: "Scan any dish and get instant nutrition info" },
  { icon: "🔥", title: "Unlimited calorie calculations", desc: "No limits on recipe nutrition data" },
  { icon: "👨‍🍳", title: "Exclusive chef recipes", desc: "Access recipes not available on free plan" },
  { icon: "🗓", title: "Advanced meal planner", desc: "Plan your week and get smart shopping lists" },
];

function PremiumPromoModal({ user }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    if (!user || user.premium) return;

    const shouldShow = () => {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last) return true;
      const diff = Date.now() - parseInt(last);
      return diff > INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    };

    if (!shouldShow()) return;

    const timer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setAnimIn(true), 10);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    setAnimIn(false);
    setTimeout(() => setVisible(false), 350);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleGetPremium = () => {
    handleClose();
    setTimeout(() => navigate("/premium"), 350);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: animIn ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        transition: "background 0.35s ease",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "white",
          borderRadius: "24px 24px 0 0",
          transform: animIn ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
          overflow: "hidden",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
        </div>

        {/* Header */}
        <div style={{ background: "#242D96", margin: "12px 16px 0", borderRadius: 16, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -20, left: "30%", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💎</div>
            <div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontFamily: "Teachers, sans-serif" }}>YouChef</p>
              <h2 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 600, fontFamily: "Teachers, sans-serif" }}>Upgrade to Premium</h2>
            </div>
          </div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Teachers, sans-serif", lineHeight: 1.5, position: "relative" }}>
            Unlock unlimited AI features, exclusive recipes and advanced tools
          </p>
        </div>

        {/* Benefits */}
        <div style={{ padding: "16px 16px 0" }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < BENEFITS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF0FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {b.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "#242D96", fontSize: 14, fontFamily: "Teachers, sans-serif" }}>{b.title}</p>
                <p style={{ margin: "2px 0 0", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>{b.desc}</p>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#029663" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ padding: "16px" }}>
          <div style={{ background: "#f8f9ff", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>Premium plan</p>
              <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "#242D96", fontFamily: "Teachers, sans-serif" }}>1 500 ₸ <span style={{ fontSize: 13, fontWeight: 400, color: "#788CA5" }}>/ month</span></p>
            </div>
            <div style={{ background: "#E6FAED", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#029663", fontWeight: 600, fontFamily: "Teachers, sans-serif" }}>
              Best value
            </div>
          </div>

          <button
            onClick={handleGetPremium}
            style={{ width: "100%", padding: "14px", borderRadius: 50, background: "#242D96", color: "white", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "Teachers, sans-serif", marginBottom: 10 }}
          >
            Get Premium →
          </button>
          <button
            onClick={handleClose}
            style={{ width: "100%", padding: "12px", borderRadius: 50, background: "transparent", color: "#BBC8D8", fontSize: 14, border: "none", cursor: "pointer", fontFamily: "Teachers, sans-serif" }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default PremiumPromoModal;