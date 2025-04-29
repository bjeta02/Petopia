import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/register.css";


const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/owners/register-with-otp", {
        firstname,
        lastname,
        email,
        password,
        role: "owner"
      });

      alert(response.data.message);
      navigate(`/otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error(
        "Registration error:",
        error.response ? error.response.data.message : error.message
      );
      alert(error.response ? error.response.data.message : "An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-center-container">
      <div className="register-container-box">
        <h1 className="register-title">Sign Up</h1>
        <p className="register-subtitle">Please fill the form below to create your account.</p>
        <form onSubmit={handleSubmit}>
          <div className="register-input-group">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="register-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="privacy"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              required
            />
            <label htmlFor="privacy">
              By signing up you agree to our <a href="/terms-services" target="_blank">Terms and conditions</a> and <a href="/privacy-policy" target="_blank">Privacy policy</a>.
            </label>
          </div>

          <button 
            type="submit" 
            className="register-button" 
            disabled={!agreePrivacy} // Disable the button when agreePrivacy is false
          >
            Sign Up
          </button>
        </form>

        <div className="register-link">
          <p>Already have an account? <a href="login">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
