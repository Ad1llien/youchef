import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../logos/logo.svg";
import "../styles/style.css";
import checkLine from "../icons/checkbox-circle-fill.svg"
import API_BASE_URL from "../config/api";

function SetNewPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/reset-password");
    }
  }, [email, navigate]);

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (passwordStrength < 3) {
      setMessage("Password is too weak.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Password updated! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <img src={logo} alt="YouChef Logo" className="main-logo" />

        <h2>Set a new password</h2>
        <p className="subtitle">Set a new password for your account</p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="input-group">
            <label>New Password *</label>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPassword(value);
                  setPasswordStrength(checkPasswordStrength(value));
                }}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label>Confirm Password *</label>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
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
                }}
              ></div>
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>

          {message && (
            <p style={{ marginTop: "10px", color: "red" }}>{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default SetNewPasswordPage;