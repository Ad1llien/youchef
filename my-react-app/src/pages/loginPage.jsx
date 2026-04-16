import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import logo from "../logos/logo.svg";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // <- если используешь cookies
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

        navigate("/");
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <img src={logo} alt="YouChef Logo" className="main-logo" />
        <h2>Login to your account</h2>
        <p className="subtitle">Welcome back, please enter your details</p>

        <form onSubmit={handleLogin} className="p-3">
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-options">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />{" "}
              Keep me logged in
            </label>
            <Link to="/reset-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary">
            Log in
          </button>
        </form>

        {/* Кнопка для регистрации */}
        <div
          className="btn-secondary"
          onClick={() => navigate("/signup")}
          style={{ marginTop: "15px" }}
        >
          Don't have an account?{" "}
          <span style={{ cursor: "pointer" }}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
