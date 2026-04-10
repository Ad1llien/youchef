import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import checkLine from "../icons/checkbox-circle-fill.svg"
import "../styles/style.css"
import API_BASE_URL from "../config/api";

function PasswordManager() {

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState(""); // ✅ добавил
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.userData);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
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
          newPassword: password
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Password updated!");
        setOldPassword("");
        setPassword("");
        setConfirmPassword("");
        navigate("/login")
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

  return (
    <div className="myAccountWrapper">
      <div className="recipeEmpty">My Account</div>

      <div className="accountMenu">
        <div className="account-page">
          
          {/* LEFT SIDE */}
          <div className="left-side">
            <div className="menuwrapper">

              <div className="personalInfo " onClick={() => navigate("/my-account")}>
                <div className="rp">
                  <div>Personal Info</div>
                </div>
                <hr />
              </div>

              <div className="personalInfo">
                <div className="rp">
                  <div>Subscription</div>
                </div>
                <hr />
              </div>

              <div className="personalInfo active_MenuPage">
                <div className="rp">
                  <div>Password Manager</div>
                </div>
                <hr />
              </div>

              <div className="personalInfo" onClick={() => navigate("/my-likes")}>
                <div className="rp">
                  <div>Favorites</div>
                </div>
                <hr />
              </div>

              <div
                className="personalInfo"
                onClick={() => setShowLogoutModal(true)}
              >
                <div className="rp">
                  <div>Logout</div>
                </div>
                <hr />
              </div>

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right-side">

            <div className="input-group">
              <label>Enter old password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Old password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
            </div>

            {/* ✅ ЭТО НОВЫЙ ПАРОЛЬ (исправил) */}
            <div className="input-group">
              <label>Enter New password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(checkPasswordStrength(e.target.value));
                  }}
                />
              </div>
            </div>

            {/* ✅ ЭТО CONFIRM (исправил) */}
            <div className="input-group">
              <label>Confirm New password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Repeat new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* strength bar */}
              <div className="password-strength">
                <div
                  className="strength-bar"
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
                    height: "5px",
                    marginTop: "5px",
                    borderRadius: "3px"
                  }}
                ></div>
              </div>

              {password && passwordStrength < 3 && (
                <p style={{ color: "red", marginTop: "5px" }}>
                  Password is too weak
                </p>
              )}

              {passwordStrength >= 3 && (
                <p style={{ color: "green", marginTop: "5px" }}>
                  Strong password
                </p>
              )}
            </div>

            <div className="passwordStrengthIndicator">
              <div className="passwS">Password Strength</div>
              <div>Must contain at least:</div>
              <div className="try">
                <img src={checkLine} alt="" />
                <div>1 uppercase</div>
              </div>
              <div className="try">
                <img src={checkLine} alt="" />
                <div>1 number</div>
              </div>
              <div className="try">
                <img src={checkLine} alt="" />
                <div>At least 8 characters</div>
              </div>
            </div>

            <button
              className="searchBtn btn_center"
              onClick={handleUpdate}>
              Change
            </button>

            {message && (
              <p className="errorMessagePassword_"> {/* ✅ исправил classname */}
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="logoutModalOverlay">
          <div className="logoutModal">
            <h3>Logout</h3>
            <p>Are you sure you want to log out of your account?</p>

            <div className="logoutButtons">
              <button
                className="cancelBtn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                className="logoutBtn"
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