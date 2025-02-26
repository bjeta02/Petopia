import React, { useState } from "react";
import axios from "axios"; // Import axios for making API calls
import "../components/css/login.css"; // Import the CSS for styling

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error messages
  const [loading, setLoading] = useState(false); // State to manage loading state

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    setLoading(true); // Set loading state to true
    setError(''); // Reset error message

    try {
      // Make API call to login
      const response = await axios.post(`http://localhost:5000/api/owners/login`, {
        email: username, // Assuming username is the email
        password: password,

      });
      // Handle successful login
      console.log('Login successful:', response.data);
      // You can store the token in local storage or context
      localStorage.setItem('token', response.data.token);
      // Redirect to dashboard or another page
      window.location.href = '/home'; // Change this to your dashboard route
    } catch (err) {
      // Handle error
      console.error('Login error:', err.response ? err.response.data.message : err.message);
      setError(err.response ? err.response.data.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="center-container">
      <div className="container-box">
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
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