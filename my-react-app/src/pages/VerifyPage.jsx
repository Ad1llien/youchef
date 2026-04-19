import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../logos/logo.svg";
import "../styles/style.css";
import API_BASE_URL, { apiFetch } from "../config/api";

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
          {isError ? "Verification failed" : "Email verified!"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#BBC8D8", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

const VerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;
  const email = location.state?.email || "";

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filled, setFilled] = useState(0);
  const inputsRef = useRef([]);

  const showToast = (message, type = "error") => setToast({ message, type });

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    e.target.value = value.slice(-1);

    const count = inputsRef.current.filter(i => i?.value).length;
    setFilled(count);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!e.target.value && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      setTimeout(() => {
        const count = inputsRef.current.filter(i => i?.value).length;
        setFilled(count);
      }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    pasted.split("").forEach((char, i) => {
      if (inputsRef.current[i]) inputsRef.current[i].value = char;
    });
    setFilled(pasted.length);
    const next = pasted.length < 6 ? pasted.length : 5;
    inputsRef.current[next]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = inputsRef.current.map(i => i?.value || "").join("");

    if (otp.length !== 6) {
      showToast("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/verify-Account`, {
        method: "POST",
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Redirecting to login...", "success");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        showToast(data.message || "Invalid code. Please try again.");
        inputsRef.current.forEach(i => {
          if (i) {
            i.classList.add("otp-shake");
            setTimeout(() => i.classList.remove("otp-shake"), 500);
          }
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .otp-input {
          width: 48px; height: 56px;
          border-radius: 12px;
          border: 2px solid #BBC8D8;
          background: white;
          font-size: 22px; font-weight: 700;
          color: #242D96; text-align: center;
          outline: none; caret-color: #242D96;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          font-family: Teachers, sans-serif;
        }
        .otp-input:focus {
          border-color: #242D96;
          box-shadow: 0 0 0 3px rgba(36,45,150,0.1);
          transform: scale(1.06);
        }
        .otp-input:not(:placeholder-shown) {
          border-color: #242D96;
          background: #f0f4ff;
        }
        @keyframes otpShake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-5px); }
          40%,80% { transform: translateX(5px); }
        }
        .otp-shake { animation: otpShake 0.4s ease; border-color: #FF786D !important; background: #fff5f5 !important; }
        .verify-btn {
          width: 100%; padding: 13px; border-radius: 50px;
          background: #242D96; color: white; border: none;
          font-size: 15px; font-weight: 600; font-family: Teachers, sans-serif;
          cursor: pointer; transition: background 0.2s, transform 0.1s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px;
        }
        .verify-btn:hover:not(:disabled) { background: #1e2580; }
        .verify-btn:active:not(:disabled) { transform: scale(0.98); }
        .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes spinBtn { to { transform: rotate(360deg); } }
        .btn-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; animation: spinBtn 0.7s linear infinite; flex-shrink: 0; }
        .email-badge {
          display: inline-block;
          background: #EEF0FB; color: #242D96;
          border-radius: 20px; padding: 2px 10px;
          font-size: 13px; font-weight: 600;
          font-family: Teachers, sans-serif;
        }
      `}</style>

      <div className="auth-card">
        <img src={logo} alt="YouChef Logo" className="main-logo" />

        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EEF0FB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
          ✉️
        </div>

        <h2>Verify your email</h2>
        <p className="subtitle">
          We've sent a 6-digit code to<br />
          {email
            ? <span className="email-badge">{email}</span>
            : <span style={{ color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>your email</span>
          }
        </p>

        <form onSubmit={handleVerify} className="p-3">
          {/* OTP inputs */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }} onPaste={handlePaste}>
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                className="otp-input"
                type="text"
                maxLength="1"
                inputMode="numeric"
                placeholder="·"
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i < filled ? "#242D96" : "#e5e7eb",
                transition: "background 0.2s",
              }} />
            ))}
          </div>

          <button type="submit" className="verify-btn" disabled={loading || filled < 6}>
            {loading ? <><span className="btn-spinner" /> Verifying...</> : "Verify Email"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
          Didn't receive the code?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "#242D96", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;