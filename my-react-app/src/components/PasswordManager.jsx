import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import checkLine from "../icons/checkbox-circle-fill.svg";
import API_BASE_URL from "../config/api";
import AccountNavigation from "./AccountNavigation";

function PasswordManager() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState(""); // ✅ добавил
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [_user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.userData);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    setMessage("");

    if (passwordStrength < 3) {
      setMessage("Password too weak");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Password updated!");
        setOldPassword("");
        setPassword("");
        setConfirmPassword("");
        navigate("/login");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  // 🔐 проверка силы пароля
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  return (
    <div className="mx-auto mt-[102px] w-full max-w-6xl px-4 md:px-6">
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
            <div>
              <label className="mb-2 block font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
                Enter old password
              </label>
              <input
                type="password"
                placeholder="Old password"
                required
                value={oldPassword}
                className="h-14 w-full rounded-[8px] border border-[#BBC8D8] bg-white/70 px-4 font-['Teachers'] text-[16px] text-[#13151A] outline-none transition focus:border-[#242D96]"
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
                Enter New password
              </label>
              <input
                type="password"
                placeholder="New password"
                required
                value={password}
                className="h-14 w-full rounded-[8px] border border-[#BBC8D8] bg-white/70 px-4 font-['Teachers'] text-[16px] text-[#13151A] outline-none transition focus:border-[#242D96]"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrength(checkPasswordStrength(e.target.value));
                }}
              />
            </div>

            <div>
              <label className="mb-2 block font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
                Confirm New password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                required
                value={confirmPassword}
                className="h-14 w-full rounded-[8px] border border-[#BBC8D8] bg-white/70 px-4 font-['Teachers'] text-[16px] text-[#13151A] outline-none transition focus:border-[#242D96]"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-3 h-[6px] w-full rounded-full bg-[#E5E7EB]">
              <div
                style={{
                  width: `${passwordStrength * 25}%`,
                  background:
                    passwordStrength === 1
                      ? "red"
                      : passwordStrength === 2
                        ? "orange"
                        : passwordStrength === 3
                          ? "yellow"
                          : passwordStrength === 4
                            ? "green"
                            : "transparent",
                  height: "100%",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {password && passwordStrength < 3 && (
              <p className="mt-2 text-sm text-red-600">Password is too weak</p>
            )}

            {passwordStrength >= 3 && (
              <p className="mt-2 text-sm text-green-600">Strong password</p>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <div className="font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
              Password Strength
            </div>
            <div className="font-['Teachers'] text-[14px] font-medium leading-[20px] tracking-[-0.14px] text-[#242D96]">
              Must contain at least:
            </div>
            <div className="flex items-center gap-2">
              <img src={checkLine} alt="" />
              <div
                className={`font-['Teachers'] text-[14px] ${hasUppercase ? "font-medium text-[#16A34A]" : "text-[#838B9E]"}`}
              >
                1 uppercase
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src={checkLine} alt="" />
              <div
                className={`font-['Teachers'] text-[14px] ${hasNumber ? "font-medium text-[#16A34A]" : "text-[#838B9E]"}`}
              >
                1 number
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src={checkLine} alt="" />
              <div
                className={`font-['Teachers'] text-[14px] ${hasMinLength ? "font-medium text-[#16A34A]" : "text-[#838B9E]"}`}
              >
                At least 8 characters
              </div>
            </div>
          </div>

          <button
            className="mt-6 w-full max-w-[300px] rounded-full bg-[#242D96] px-6 py-3 font-['Teachers'] text-[24px] font-medium leading-none text-white transition hover:bg-[#1d2577]"
            onClick={handleUpdate}
            type="button"
          >
            Change
          </button>

          {message && (
            <p className="mt-4 max-w-[420px] text-center text-sm text-red-600">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-[#13151A]">
              Logout
            </h3>
            <p className="mb-6 text-sm text-[#555]">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-between gap-3">
              <button
                className="flex-1 rounded-lg bg-[#eee] px-4 py-2.5 text-sm font-medium text-[#333]"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                className="flex-1 rounded-lg bg-[#e53935] px-4 py-2.5 text-sm font-medium text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordManager;
