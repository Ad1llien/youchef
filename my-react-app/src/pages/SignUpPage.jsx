import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logos/logo.svg";
import "../styles/style.css";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [message, setMessage] = useState("");

  // Функция для проверки силы пароля
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
      setMessage("Password is too weak. Include uppercase letters, numbers, and symbols.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong!");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <img src={logo} alt="Logo" className="main-logo" />
        <h2>Create your account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                setPasswordStrength(checkPasswordStrength(value));
              }}
            />
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
          </div>

          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>

        {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}

        <button
          className="btn-secondary"
          onClick={() => navigate("/login")}
          style={{ marginTop: "15px" }}
        >
          Already registered?
        </button>
      </div>
    </div>
  );
};

export default SignUpPage;