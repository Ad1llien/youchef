import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [message, setMessage] = useState("");
  const inputsRef = useRef([]);

  const handleVerify = async () => {
    const otp = inputsRef.current.map((input) => input.value).join("");

    if (otp.length !== 6) {
      setMessage("Enter 6-digit code");
      return;
    }

    if (!userId) {
      setMessage("UserId missing. Go back and register again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong!");
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    e.target.value = value.slice(-1);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Verify your email</h2>
        <p>We sent you an OTP. Please enter it below:</p>

        {/* ⬇️ ЗАМЕНИЛИ ТОЛЬКО INPUT */}
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
            />
          ))}
        </div>

        <button className="btn-primary" onClick={handleVerify}>
          Verify
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default CheckEmailPage;