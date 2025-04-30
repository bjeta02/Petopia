import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import "./css/resetPassword.css"; // Import the CSS

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSendReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-reset", { email });
      setMessage(res.data.message);
      setError("");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-reset", {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setError("");

      // Navigate to login after short delay
        setTimeout(() => {
            navigate("/login");
        }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="title">Reset Password</h2>

      {message && <Message severity="success" text={message} className="p-mb-3" />}
      {error && <Message severity="error" text={error} className="p-mb-3" />}

      {step === 1 && (
        <form onSubmit={handleSendReset} className="reset-form">
          <div className="p-field">
            <label htmlFor="email">Email Address</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-inputtext-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          <Button label="Send OTP" type="submit" className="w-full reset-button" style={{backgroundColor: ""}} />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyReset} className="reset-form">
          <div className="p-field">
            <label htmlFor="otp">OTP</label>
            <InputText
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="p-inputtext-sm"
              placeholder="Enter OTP"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="newPassword">New Password</label>
            <InputText
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              toggleMask
              feedback={false}
              className="p-inputtext-sm"
              placeholder="Enter your new password"
              required
            />
          </div>
          <Button
            label="Reset Password"
            type="submit"
            className="p-button-rounded p-button-success w-full"
          />
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
