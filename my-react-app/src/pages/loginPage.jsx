import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import logo from "../logos/logo.svg";
import { Link } from "react-router-dom";
import API_BASE_URL, { apiFetch } from "../config/api";
import { GoogleLogin } from "@react-oauth/google";
import SetPasswordModal from "../components/SetPasswordModal";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
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
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-16px) scale(0.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}`}</style>
      <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: isError ? "#FFF0EE" : "#E6FAF0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
        {isError ? "⚠️" : "✓"}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#242D96", fontFamily: "Teachers, sans-serif" }}>{isError ? "Login failed" : "Success"}</p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>{toast.message}</p>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#BBC8D8", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Email login ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (remember) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("savedEmail", email);
        } else {
          sessionStorage.setItem("token", data.token);
        }
        showToast("Welcome back!", "success");
        setTimeout(() => navigate("/"), 800);
      } else {
        showToast(data.message || "Invalid email or password.");
      }
    } catch {
      showToast("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google login ─────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        showToast("Welcome!", "success");

        if (data.needsPassword) {
          // Показываем модалку установки пароля
          setTimeout(() => setShowSetPassword(true), 500);
        } else {
          setTimeout(() => navigate("/"), 800);
        }
      } else {
        showToast(data.message || "Google login failed");
      }
    } catch {
      showToast("Connection error");
    }
  };

  return (
    <div className="auth-wrapper">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Модалка установки пароля */}
      {showSetPassword && (
        <SetPasswordModal onClose={() => { setShowSetPassword(false); navigate("/"); }} />
      )}

      <style>{`
        .yc-input { width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #BBC8D8;font-size:15px;font-family:Teachers,sans-serif;outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;background:white;color:#242D96; }
        .yc-input:focus { border-color:#242D96;box-shadow:0 0 0 3px rgba(36,45,150,0.08); }
        .yc-input::placeholder { color:#BBC8D8; }
        .pw-wrapper { position:relative; }
        .pw-toggle { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#BBC8D8;padding:0;display:flex;align-items:center; }
        .pw-toggle:hover { color:#242D96; }
        .login-btn { width:100%;padding:13px;border-radius:50px;background:#242D96;color:white;border:none;font-size:15px;font-weight:600;font-family:Teachers,sans-serif;cursor:pointer;transition:background 0.2s,transform 0.1s;display:flex;align-items:center;justify-content:center;gap:8px; }
        .login-btn:hover:not(:disabled) { background:#1e2580; }
        .login-btn:active:not(:disabled) { transform:scale(0.98); }
        .login-btn:disabled { opacity:0.7;cursor:not-allowed; }
        @keyframes spinBtn { to { transform:rotate(360deg); } }
        .btn-spinner { width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);border-top-color:white;animation:spinBtn 0.7s linear infinite; }
        .divider { display:flex;align-items:center;gap:12px;margin:16px 0; }
        .divider::before,.divider::after { content:"";flex:1;height:1px;background:#e8ecf8; }
        .divider span { color:#BBC8D8;font-size:13px;font-family:Teachers,sans-serif; }
      `}</style>

      <div className="auth-card">
        <img src={logo} alt="YouChef Logo" className="main-logo" />
        <h2>Login to your account</h2>
        <p className="subtitle">Welcome back, please enter your details</p>

        <form onSubmit={handleLogin} className="p-3">
          <div className="input-group">
            <label>Email Address *</label>
            <input className="yc-input" type="email" placeholder="hello@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <div className="input-wrapper pw-wrapper">
              <input className="yc-input" type={showPassword ? "text" : "password"} placeholder="Enter password" required value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 42 }} />
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
          </div>

          <div className="form-options">
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Keep me logged in
            </label>
            <Link to="/reset-password">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Logging in...</> : "Log in"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
  <div style={{ flex: 1, height: 1, background: "#e8ecf8" }} />
  <span style={{ color: "#BBC8D8", fontSize: 13, fontFamily: "Teachers, sans-serif", lineHeight: 1 }}>or</span>
  <div style={{ flex: 1, height: 1, background: "#e8ecf8" }} />
</div>

        {/* Google Login */}
        <div style={{ width: "100%", marginBottom: 8 }}>
  <style>{`
    .google-btn-wrapper > div,
    .google-btn-wrapper iframe,
    .google-btn-wrapper > div > div {
      width: 100% !important;
      border-radius: 50px !important;
    }
  `}</style>
  <div className="google-btn-wrapper">
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => showToast("Google login failed")}
      useOneTap={false}
      shape="pill"
      text="signin_with"
      locale="en"
      width="100%"
    />
  </div>
</div>

        <div className="btn-secondary" onClick={() => navigate("/signup")} style={{ marginTop: "15px" }}>
          Don't have an account? <span style={{ cursor: "pointer" }}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;