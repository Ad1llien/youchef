import { useState } from "react";
import API_BASE_URL, { apiFetch } from "../config/api";

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

function SetPasswordModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["transparent", "#FF786D", "#ED8B07", "#f0c040", "#029663"][strength];

  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async () => {
    if (strength < 3) return setError("Please use a stronger password.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/set-password`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
      } else {
        setError(data.message || "Error");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 }}>
      <div style={{ background: "white", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        <style>{`
          .sp-input { width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #BBC8D8;font-size:15px;font-family:Teachers,sans-serif;outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;background:white;color:#242D96; }
          .sp-input:focus { border-color:#242D96;box-shadow:0 0 0 3px rgba(36,45,150,0.08); }
          .sp-input::placeholder { color:#BBC8D8; }
          .sp-input.match { border-color:#029663; }
          .sp-input.mismatch { border-color:#FF786D; }
          .sp-toggle { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#BBC8D8;padding:0;display:flex;align-items:center; }
          .sp-toggle:hover { color:#242D96; }
          @keyframes spinSP { to { transform:rotate(360deg); } }
          .sp-spinner { width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);border-top-color:white;animation:spinSP 0.7s linear infinite; }
        `}</style>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h2 style={{ margin: 0, color: "#242D96", fontFamily: "Taviraj,serif", fontSize: 22, fontWeight: 500 }}>Set Your Password</h2>
          <p style={{ margin: "8px 0 0", color: "#788CA5", fontSize: 13, fontFamily: "Teachers,sans-serif", lineHeight: 1.5 }}>
            Create a password to use email login and connect your Telegram account
          </p>
        </div>

        {/* New Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#242D96", fontFamily: "Teachers,sans-serif", fontWeight: 600 }}>Password *</label>
          <div style={{ position: "relative" }}>
            <input
              className="sp-input"
              type={showPw ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              style={{ paddingRight: 42 }}
              onChange={e => { setPassword(e.target.value); setStrength(checkStrength(e.target.value)); setError(""); }}
            />
            <button type="button" className="sp-toggle" onClick={() => setShowPw(v => !v)}>
              <EyeIcon open={showPw} />
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strength ? strengthColor : "#f0f0f0", transition: "background 0.3s" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {checks.map(({ label, pass }) => (
                    <span key={label} style={{ fontSize: 11, color: pass ? "#029663" : "#BBC8D8", display: "flex", alignItems: "center", gap: 3, fontFamily: "Teachers,sans-serif" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d={pass ? "M2 6l3 3 5-5" : "M3 3l6 6M9 3l-6 6"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {label}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor, fontFamily: "Teachers,sans-serif" }}>{strengthLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#242D96", fontFamily: "Teachers,sans-serif", fontWeight: 600 }}>Confirm Password *</label>
          <div style={{ position: "relative" }}>
            <input
              className={`sp-input ${passwordsMatch ? "match" : passwordsMismatch ? "mismatch" : ""}`}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              style={{ paddingRight: 42 }}
              onChange={e => { setConfirm(e.target.value); setError(""); }}
            />
            <button type="button" className="sp-toggle" onClick={() => setShowConfirm(v => !v)}>
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {passwordsMismatch && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#FF786D", fontFamily: "Teachers,sans-serif" }}>Passwords do not match</p>}
          {passwordsMatch && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#029663", fontFamily: "Teachers,sans-serif" }}>✓ Passwords match</p>}
        </div>

        {error && <p style={{ color: "#e53935", fontSize: 13, fontFamily: "Teachers,sans-serif", margin: "0 0 12px", textAlign: "center" }}>{error}</p>}

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={loading || passwordsMismatch || password.length === 0}
            style={{ padding: "13px", borderRadius: 50, background: "#242D96", color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Teachers,sans-serif", fontSize: 15, fontWeight: 600, opacity: loading || passwordsMismatch || password.length === 0 ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><span className="sp-spinner" /> Saving...</> : "Set Password →"}
          </button>
          <button
            onClick={onClose}
            style={{ padding: "12px", borderRadius: 50, background: "transparent", color: "#BBC8D8", border: "none", cursor: "pointer", fontFamily: "Teachers,sans-serif", fontSize: 14 }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetPasswordModal;