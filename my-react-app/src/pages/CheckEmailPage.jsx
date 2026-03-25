import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId; // передаём из SignUpPage через navigate
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();
      
      if (!userId) {
        setMessage("UserId missing. Go back and register again.");
        return;
      }

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

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Verify your email</h2>
        <p>We sent you an OTP. Please enter it below:</p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button className="btn-primary" onClick={handleVerify}>
          Verify
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default CheckEmailPage;