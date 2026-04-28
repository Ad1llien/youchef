import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logos/logo.svg";
import "../styles/style.css";
import API_BASE_URL, { apiFetch } from "../config/api";
import AuthLangButton from "../components/AuthLangButton";

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
          {isError ? "Error" : "Email sent!"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#BBC8D8", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "error") => setToast({ message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/send-reset-otp`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Check your inbox for the reset code.", "success");
        setTimeout(() => navigate("/verify-account", { state: { email } }), 1200);
      } else {
        showToast(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ position: "relative" }}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <AuthLangButton />

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
        .reset-btn {
          width: 100%; padding: 13px; border-radius: 50px;
          background: #242D96; color: white; border: none;
          font-size: 15px; font-weight: 600; font-family: Teachers, sans-serif;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
        }
        .reset-btn:hover:not(:disabled) { background: #1e2580; }
        .reset-btn:active:not(:disabled) { transform: scale(0.98); }
        .reset-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spinBtn { to { transform: rotate(360deg); } }
        .btn-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; animation: spinBtn 0.7s linear infinite; flex-shrink: 0; }
      `}</style>

      <div className="auth-card">
        <div className="logo">
          <img src={logo} alt="YouChef Logo" className="main-logo" />
        </div>

        <h2>Reset your password</h2>
        <p className="subtitle">Enter your account email to reset password</p>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                className="yc-input"
                type="email"
                placeholder="name@website.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Sending...</> : "Reset Password"}
          </button>
        </form>

        <div className="btn-secondary" onClick={() => navigate("/login")} style={{ marginTop: "15px" }}>
          Remember your password?{" "}
          <span style={{ cursor: "pointer" }}>Log in</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;