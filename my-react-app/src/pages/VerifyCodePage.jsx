import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import logo from "../logos/logo.svg";
import API_BASE_URL from "../config/api";

function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [message, setMessage] = useState("");

  const inputsRef = useRef([]);

  // переход к следующему input
  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    e.target.value = value.slice(-1);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // backspace назад
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otp = inputsRef.current.map((input) => input.value).join("");

    if (otp.length !== 6) {
      setMessage("Please enter the 6-digit code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        navigate("/setNewPassword", {
          state: { email, otp },
        });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div className="authWrapper">
      <div className="auth-container">
        <div className="logo">
          <img src={logo} alt="YouChef Logo" className="main-logo" />
        </div>

        <h2>Enter verification code</h2>

        <p className="subtitle">
          We've sent a code to <span className="user-email">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="otp-container">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                inputMode="numeric"
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))}
          </div>

          <button type="submit" className="btn-primary">
            Verify
          </button>

          {message && (
            <p style={{ marginTop: "12px", color: "red" }}>{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default VerifyCodePage;
