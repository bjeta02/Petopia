import React, { useState } from "react";
import "../components/css/login.css";  // Import the CSS for styling

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle login form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    console.log('Username:', username);
    console.log('Password:', password);
    // Add your login logic here (e.g., make API calls)
  };

  return (
    <div className="center-container">
      <div className="container-box">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="register-link">
          <p>Don't have an account? <a href="register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
