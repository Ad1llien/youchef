import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logos/logo.svg";
import "../styles/style.css";
import checkLine from "../icons/checkbox-circle-fill.svg";
import API_BASE_URL from "../config/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [modal, setModal] = useState({
    open: false,
    text: "",
    type: "success",
  });
  const [userId, setUserId] = useState(""); // ✅ добавлено для хранения userId

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

    if (passwordStrength < 3) {
      setModal({
        open: true,
        text: "Password is too weak",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setUserId(data.userId);
        navigate("/check-email", { state: { userId: data.userId } }); // сразу на проверку email
      } else {
        setModal({
          open: true,
          text: data.message || "Registration failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        text: "Something went wrong!",
        type: "error",
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card signup">
        <img src={logo} alt="YouChef Logo" className="main-logo" />
        <h2>Create your account</h2>
        <p className="subtitle">Please enter your details to get started</p>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="input-group">
            <label>Full Name *</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Mason Taylor"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address *</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="hello@squareui.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password *</label>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Enter Password"
                required
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  setPasswordStrength(checkPasswordStrength(value));
                }}
              />
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
                  height: "5px",
                  marginTop: "5px",
                  borderRadius: "3px",
                }}
              ></div>
            </div>
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

          <div className="form-options">
            <label>
              <input type="checkbox" required /> I agree to terms
            </label>
          </div>

          <button type="submit" className="btn-primary">
            Register
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

        {modal.open && (
          <div className="logoutModalOverlay">
            <div className="logoutModal">
              <h3>{modal.type === "success" ? "Success" : "Error"}</h3>
              <p>{modal.text}</p>

              <div className="logoutButtons">
                <button
                  className="cancelBtn"
                  onClick={() => setModal({ ...modal, open: false })}
                >
                  Close
                </button>

                {modal.type === "success" && (
                  <button
                    className="logoutBtn"
                    onClick={() => {
                      setModal({ ...modal, open: false });
                      navigate("/check-email", { state: { userId } }); // ✅ используем state
                    }}
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
