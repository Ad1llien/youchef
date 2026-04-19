import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountNavigation from "./AccountNavigation";
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
      <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: isError ? "#FFF0EE" : "#E6FAF0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
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

function PasswordManager() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [_user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/user/data`, { method: "GET"})
      .then(res => res.json())
      .then(data => { if (data.success) setUser(data.userData); })
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
      navigate("/login");
    } catch (err) { console.error(err); }
  };

  const checkPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const handleUpdate = async () => {
    if (passwordStrength < 3) { showToast("Password is too weak."); return; }
    if (password !== confirmPassword) { showToast("Passwords do not match."); return; }

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        
        body: JSON.stringify({ oldPassword, newPassword: password }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Your password has been changed.", "success");
        setOldPassword(""); setPassword(""); setConfirmPassword("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showToast(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error. Try again later.");
    }
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["transparent", "#FF786D", "#ED8B07", "#f0c040", "#029663"][passwordStrength];
  const hasUppercase  = /[A-Z]/.test(password);
  const hasNumber     = /[0-9]/.test(password);
  const hasMinLength  = password.length >= 8;
  const passwordsMatch    = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#BBC8D8", padding: 0, display: "flex", alignItems: "center" }}>
      {show ? (
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
  );

  return (
    <div className="mx-auto mt-[102px] w-full max-w-6xl px-4 md:px-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <h1 className="mb-6 text-center font-['Taviraj'] text-[32px] font-normal leading-normal text-[#242D96] md:mb-[80px]">
        My Account
      </h1>

      <div className="flex flex-col gap-11 md:gap-20 md:flex-row md:items-start">
        <AccountNavigation
          activeItem="password"
          onOpenPersonalInfo={() => navigate("/my-account")}
          onSubscription={() => navigate("/premium")}
          onOpenPasswordManager={() => navigate("/password-manager")}
          onOpenLikes={() => navigate("/my-likes")}
          onLogout={() => setShowLogoutModal(true)}
        />

        <div className="w-full md:flex-1">
          <div className="w-[270px] md:w-full max-w-[560px] min-w-0 space-y-5">

            {/* Old password */}
            <div>
              <label className="mb-2 block font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
                Current password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Enter current password"
                  required value={oldPassword}
                  className="h-14 w-full rounded-[8px] border border-[#BBC8D8] bg-white/70 px-4 font-['Teachers'] text-[16px] text-[#13151A] outline-none transition focus:border-[#242D96]"
                  style={{ paddingRight: 44 }}
                  onChange={e => setOldPassword(e.target.value)}
                />
                <EyeBtn show={showOld} onToggle={() => setShowOld(v => !v)} />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="mb-2 block font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
                New password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  required value={password}
                  className="h-14 w-full rounded-[8px] border border-[#BBC8D8] bg-white/70 px-4 font-['Teachers'] text-[16px] text-[#13151A] outline-none transition focus:border-[#242D96]"
                  style={{ paddingRight: 44 }}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordStrength(checkPasswordStrength(e.target.value));
                  }}
                />
                <EyeBtn show={showNew} onToggle={() => setShowNew(v => !v)} />
              </div>

              {/* ── PASSWORD STRENGTH (same as SignUpPage) ── */}
              {password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {/* 4 coloured bars */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: i <= passwordStrength ? strengthColor : "#E5E7EB",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  {/* live checks + label */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {[
                        { label: "1 uppercase",    pass: hasUppercase },
                        { label: "1 number",       pass: hasNumber },
                        { label: "8+ characters",  pass: hasMinLength },
                      ].map(({ label, pass }) => (
                        <span key={label} style={{ fontSize: 12, color: pass ? "#029663" : "#BBC8D8", display: "flex", alignItems: "center", gap: 4, fontFamily: "Teachers, sans-serif", transition: "color 0.2s" }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d={pass ? "M2 6l3 3 5-5" : "M3 3l6 6M9 3l-6 6"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {label}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: strengthColor, fontFamily: "Teachers, sans-serif", flexShrink: 0, transition: "color 0.3s" }}>
                      {strengthLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-2 block font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
                Confirm new password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat new password"
                  required value={confirmPassword}
                  className="h-14 w-full rounded-[8px] bg-white/70 px-4 font-['Teachers'] text-[16px] text-[#13151A] outline-none transition"
                  style={{
                    paddingRight: 44,
                    border: `1.5px solid ${passwordsMatch ? "#029663" : passwordsMismatch ? "#FF786D" : "#BBC8D8"}`,
                  }}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <EyeBtn show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
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
          </div>

          <button
            className="mt-6 w-full max-w-[300px] rounded-full bg-[#242D96] px-6 py-3 font-['Teachers'] text-[24px] font-medium leading-none text-white transition hover:bg-[#1d2577]"
            onClick={handleUpdate}
            type="button"
            disabled={passwordsMismatch}
            style={{ opacity: passwordsMismatch ? 0.6 : 1 }}
          >
            Change
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-[#13151A]">Logout</h3>
            <p className="mb-6 text-sm text-[#555]">Are you sure you want to log out of your account?</p>
            <div className="flex justify-between gap-3">
              <button className="flex-1 rounded-lg bg-[#eee] px-4 py-2.5 text-sm font-medium text-[#333]" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="flex-1 rounded-lg bg-[#e53935] px-4 py-2.5 text-sm font-medium text-white" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordManager;