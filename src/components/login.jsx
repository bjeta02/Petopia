import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../components/css/login.css";
import { Navigation } from "./navigation";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to login
      const response = await axios.post(`http://localhost:5000/api/owners/login`, {
        email: username,
        password: password,
      });

      // Handle successful login
      console.log('Login successful:', response.data);
      const { token, user } = response.data;

      // Store data in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role); // Store role for later use

      // Redirect based on role
      if (user.role === 'owner') {
        localStorage.setItem('ownerId', user.ownerId);
        navigate('/home');
      } else if (user.role === 'clinic') {
        localStorage.setItem('clinicId', user.clinicId);
        navigate('/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/home'); // Default fallback
      }
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data.message : err.message);
      setError(err.response ? err.response.data.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-container">
      <Navigation />
      <div className="container-box">
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="register-link">
          <p>Don't have an account? <a href="register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
