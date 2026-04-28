import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../logos/logo.svg";
import "../styles/style.css";
import API_BASE_URL, { apiFetch } from "../config/api";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 2000, display: "flex", alignItems: "center", gap: 12,
      background: "white", borderRadius: 14, padding: "14px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      border: `1.5px solid ${isError ? "#FFD5D1" : "#C8F2D8"}`,
      minWidth: 280, maxWidth: 400,
      animation: "toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
    }}>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: isError ? "#FFF0EE" : "#E6FAF0",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>
        {isError ? "⚠️" : "✓"}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#242D96", fontFamily: "Teachers, sans-serif" }}>
          {isError ? "Error" : "Password updated!"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#BBC8D8", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

function SetNewPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const email = location.state?.email;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    if (!email) navigate("/reset-password");
  }, [email, navigate]);

  const checkPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["transparent", "#FF786D", "#ED8B07", "#f0c040", "#029663"][passwordStrength];

  const checks = [
    { label: "8+ characters", pass: newPassword.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(newPassword) },
    { label: "Number", pass: /[0-9]/.test(newPassword) },
  ];

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordStrength < 3) {
      showToast("Please use a stronger password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("Redirecting to login...", "success");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showToast(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      showToast("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="auth-wrapper">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .yc-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          border: 1.5px solid #BBC8D8; font-size: 15px;
          font-family: Teachers, sans-serif; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box; background: white; color: #242D96;
        }
        .yc-input:focus { border-color: #242D96; box-shadow: 0 0 0 3px rgba(36,45,150,0.08); }
        .yc-input::placeholder { color: #BBC8D8; }
        .yc-input.match { border-color: #029663; }
        .yc-input.mismatch { border-color: #FF786D; }
        .pw-wrapper { position: relative; }
        .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #BBC8D8; padding: 0; display: flex; align-items: center; transition: color 0.15s; }
        .pw-toggle:hover { color: #242D96; }
        .submit-btn {
          width: 100%; padding: 13px; border-radius: 50px;
          background: #242D96; color: white; border: none;
          font-size: 15px; font-weight: 600; font-family: Teachers, sans-serif;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { background: #1e2580; }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spinBtn { to { transform: rotate(360deg); } }
        .btn-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; animation: spinBtn 0.7s linear infinite; flex-shrink: 0; }
      `}</style>

<div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
  <div style={{ position: "relative" }}>
    <button
      onClick={() => setLangOpen(v => !v)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "white", border: "1.5px solid #BBC8D8",
        borderRadius: 20, padding: "6px 12px", cursor: "pointer",
        color: "#242D96", fontSize: 13, fontFamily: "Teachers, sans-serif",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#242D96" strokeWidth="1.8"/>
        <path d="M3 12H21" stroke="#242D96" strokeWidth="1.8"/>
        <path d="M12 3C14.5 5.7 15.9 8.8 15.9 12C15.9 15.2 14.5 18.3 12 21" stroke="#242D96" strokeWidth="1.8"/>
        <path d="M12 3C9.5 5.7 8.1 8.8 8.1 12C8.1 15.2 9.5 18.3 12 21" stroke="#242D96" strokeWidth="1.8"/>
      </svg>
      {currentLang.toUpperCase()}
    </button>
    {langOpen && (
      <div style={{
        position: "absolute", top: "calc(100% + 6px)", right: 0,
        background: "white", border: "1px solid #BBC8D8",
        borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        zIndex: 100, overflow: "hidden", minWidth: 64,
      }}>
        {[{label:"RU",value:"ru"},{label:"KZ",value:"kk"},{label:"EN",value:"en"},{label:"ES",value:"es"}].map(opt => (
          <button key={opt.value} onClick={() => { setCurrentLang(opt.label); const s = document.querySelector(".goog-te-combo"); if(s){s.value=opt.value;s.dispatchEvent(new Event("change"));} setLangOpen(false); }}
            style={{ display: "block", width: "100%", padding: "8px 14px", background: currentLang === opt.label ? "#EEF0FB" : "transparent", border: "none", cursor: "pointer", color: "#242D96", fontSize: 13, fontFamily: "Teachers, sans-serif", textAlign: "left" }}>
            {opt.label}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

      <div className="auth-card">
        <img src={logo} alt="YouChef Logo" className="main-logo" />
        <h2>Set a new password</h2>
        <p className="subtitle">Set a new password for your account</p>

        <form onSubmit={handleSubmit} className="p-3">

          {/* New Password */}
          <div className="input-group">
            <label>New Password *</label>
            <div className="input-wrapper pw-wrapper">
              <input
                className="yc-input"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                style={{ paddingRight: 42 }}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewPassword(v);
                  setPasswordStrength(checkPasswordStrength(v));
                }}
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowNew(v => !v)}>
                <EyeIcon open={showNew} />
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 4,
                      background: i <= passwordStrength ? strengthColor : "#f0f0f0",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {checks.map(({ label, pass }) => (
                      <span key={label} style={{ fontSize: 11, color: pass ? "#029663" : "#BBC8D8", display: "flex", alignItems: "center", gap: 3, fontFamily: "Teachers, sans-serif" }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d={pass ? "M2 6l3 3 5-5" : "M3 3l6 6M9 3l-6 6"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {label}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor, fontFamily: "Teachers, sans-serif", flexShrink: 0 }}>
                    {strengthLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label>Confirm Password *</label>
            <div className="input-wrapper pw-wrapper">
              <input
                className={`yc-input ${passwordsMatch ? "match" : passwordsMismatch ? "mismatch" : ""}`}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                style={{ paddingRight: 42 }}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {passwordsMismatch && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#FF786D", fontFamily: "Teachers, sans-serif" }}>
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#029663", fontFamily: "Teachers, sans-serif" }}>
                ✓ Passwords match
              </p>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading || passwordsMismatch}>
            {loading ? <><span className="btn-spinner" /> Updating...</> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetNewPasswordPage;