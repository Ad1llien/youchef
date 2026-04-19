import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logos/logo.svg";
import "../styles/style.css";
import API_BASE_URL from "../config/api";

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
          {isError ? "Registration failed" : "Account created!"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#BBC8D8", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => setToast({ message, type });

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
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "1 uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "1 number", pass: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordStrength < 3) {
      showToast("Please use a stronger password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Check your email to verify your account.", "success");
        setTimeout(() => navigate("/check-email", { state: { userId: data.userId } }), 1200);
      } else {
        showToast(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        .pw-wrapper { position: relative; }
        .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #BBC8D8; padding: 0; display: flex; align-items: center; transition: color 0.15s; }
        .pw-toggle:hover { color: #242D96; }
        .signup-btn {
          width: 100%; padding: 13px; border-radius: 50px;
          background: #242D96; color: white; border: none;
          font-size: 15px; font-weight: 600; font-family: Teachers, sans-serif;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
        }
        .signup-btn:hover:not(:disabled) { background: #1e2580; }
        .signup-btn:active:not(:disabled) { transform: scale(0.98); }
        .signup-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spinBtn { to { transform: rotate(360deg); } }
        .btn-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; animation: spinBtn 0.7s linear infinite; flex-shrink: 0; }
      `}</style>

      <div className="auth-card signup">
        <img src={logo} alt="YouChef Logo" className="main-logo" />
        <h2>Create your account</h2>
        <p className="subtitle">Please enter your details to get started</p>

        <form onSubmit={handleSubmit} className="p-3">

          {/* Name */}
          <div className="input-group">
            <label>Full Name *</label>
            <div className="input-wrapper">
              <input
                className="yc-input"
                type="text"
                placeholder="Mason Taylor"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email Address *</label>
            <div className="input-wrapper">
              <input
                className="yc-input"
                type="email"
                placeholder="hello@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password *</label>
            <div className="input-wrapper pw-wrapper">
              <input
                className="yc-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                required
                value={password}
                style={{ paddingRight: 42 }}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  setPasswordStrength(checkPasswordStrength(v));
                }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? (
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
                )}
              </button>
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
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
                  <div style={{ display: "flex", gap: 12 }}>
                    {checks.map(({ label, pass }) => (
                      <span key={label} style={{ fontSize: 11, color: pass ? "#029663" : "#BBC8D8", display: "flex", alignItems: "center", gap: 3, fontFamily: "Teachers, sans-serif" }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d={pass ? "M2 6l3 3 5-5" : "M3 3l6 6M9 3l-6 6"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {label}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor, fontFamily: "Teachers, sans-serif" }}>
                    {strengthLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="form-options" style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" required />
              I agree to terms and conditions
            </label>
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Creating account...</> : "Create Account"}
          </button>
        </form>

        <div
          className="btn-secondary"
          onClick={() => navigate("/login")}
          style={{ marginTop: "15px" }}
        >
          Already have an account?{" "}
          <span style={{ cursor: "pointer" }}>Log in</span>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;