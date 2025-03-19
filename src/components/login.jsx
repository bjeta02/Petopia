import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/login.css";
import { Navigation } from "./navigation";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API call to login
      const response = await axios.post(`http://localhost:5000/api/owners/login`, {
        email: username,
        password: password,
      });

      // Handle successful login
      console.log("Login successful:", response.data);
      const { token, user } = response.data;

      // Store data in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // Redirect based on role
      if (user.role === "owner") {
        localStorage.setItem("ownerId", user.ownerId);
        navigate("/home");
      } else if (user.role === "clinic") {
        localStorage.setItem("clinicId", user.clinicId);
        navigate("/dashboard");
        window.location.reload(); // Refresh the page after navigation
      } else if (user.role === "admin") {
        navigate("/dashboard");
        window.location.reload(); // Refresh for admin as well
      } else {
        navigate("/home"); // Default fallback
      }
    } catch (err) {
      console.error("Login error:", err.response ? err.response.data.message : err.message);
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

        {error && <p className="error-message">{error}</p>} {/* 🔥 Display Error */}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Email</label>
            <input
              type="text"
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
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="google-login">
          <button onClick={handleGoogleLogin} className="google-button">
            <img src="/path/to/google-logo.png" alt="Google Logo" className="google-logo" />
            Login with Google
          </button>
        </div>

        <div className="register-link">
          <p>Don't have an account? <a href="register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
