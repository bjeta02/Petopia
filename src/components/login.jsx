import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/login.css";
import { Navigation } from "./navigation";
import googleLogo from "../assets/google-logo.png";
import { useAuth, getUserFromToken } from "./utils/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State for Remember Me checkbox
  const navigate = useNavigate();
  const { role, setUserInfo } = useAuth(); // Ensure setUser Info is available

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`http://localhost:5000/api/owners/login`, {
        email: username,
        password: password,
      });

      console.log("✅ Login successful:", response.data);
      const { token } = response.data;

      // ✅ Store token
      localStorage.setItem("token", token);

      // ✅ Decode token and set user info
      const user = getUserFromToken(); // Call this function to get user info
      if (user) {
        setUserInfo(user); // Update user info in context
      }

      // ✅ Redirect based on role
      if (user.role === "owner") {
        navigate("/home");
      } else if (user.role === "clinic" || user.role === "admin") {
        navigate("/dashboard");
        window.location.reload();
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("❌ Login error:", err.response ? err.response.data.message : err.message);
      setError(err.response ? err.response.data.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google login
  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("message");

    if (googleError) {
      setError(googleError);

      // ✅ Remove the error message from URL
      window.history.replaceState({}, document.title, "/login");
    }
  }, []);

  return (
    <div className="center-container">
      <Navigation />
      <div className="container-box">
        <h1>Login</h1>
        <p className="register-subtitle">Please login your account to continue.</p>

        {error && <p className="error-message">{error}</p>} {/* 🔥 Display Error */}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Email</label>
            <input
              type="email" // Change to email type
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
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

          {/* Remember Me and Forgot Password in two rows */}
          <div className="remember-forgot-container">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>

            <div className="forgot-password-link">
              <a href="/forgot-password">Forgot Password?</a>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Or Login With Separator */}
        <div className="or-separator">
          <span>Or login with</span>
        </div>

        <div className="google-login">
          <button onClick={handleGoogleLogin} className="google-button" disabled={loading}>
            <img src={googleLogo} alt="Google Logo" className="google-logo" />
            <span>Login with Google</span>
          </button>
        </div>

        <div className="login-link">
          <p>Don't have an account? <a href="register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;