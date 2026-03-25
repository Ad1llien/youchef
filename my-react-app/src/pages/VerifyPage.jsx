import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyPage = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const handleVerify = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/auth/verify-Account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Verified!");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Verify Email</h2>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit">Verify</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyPage;