import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "./navigation";
import axios from "axios";
import "../components/css/otppage.css";

const OtpPage = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from URL params
  const params = new URLSearchParams(location.search);
  const email = params.get("email");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/owners/verify-otp", {
        email,
        otp,
      });

      alert(response.data.message);
      navigate("/login"); // Redirect after successful verification
    } catch (error) {
      console.error(
        "OTP verification error:",
        error.response ? error.response.data.message : error.message
      );
      alert(error.response ? error.response.data.message : "OTP verification failed.");
    }
  };

  // Handle OTP Resend
  const handleResend = async () => {
    if (canResend) {
      try {
        await axios.post("http://localhost:5000/api/owners/resend-otp", { email });
        alert("New OTP sent to your email.");
        setTimer(300);
        setCanResend(false);
      } catch (error) {
        console.error("OTP resend error:", error.message);
        alert("Failed to resend OTP. Try again later.");
      }
    }
  };

  return (
    <div className="otp-container">
      <Navigation />
      <div className="otp-box">
        <h2>Verify Your Email</h2>
        <p>We have sent a 6-digit OTP code to your email: <strong>{email}</strong></p>
        
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            className="otp-input"
            placeholder="Enter OTP"
            required
          />
          <button type="submit" className="verify-btn">Verify OTP</button>
        </form>

        <div className="resend-container">
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`resend-otp ${!canResend ? "disabled" : ""}`}
          >
            Resend OTP {canResend ? "" : `in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;