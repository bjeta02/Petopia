import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios"; // Import axios for making API calls
import "../components/css/login.css"; // Import the CSS for styling

const Register = () => {
  const location = useLocation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('pet_owner'); // Default role

  // Extract email from URL and auto-fill the email field
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        firstname,
        lastname,
        email,
        password,
        role,
      });

      // Handle successful registration
      console.log("Registration successful:", response.data);
      alert("Registration successful! You can now log in.");
      // Optionally redirect to login page
      window.location.href = '/login';
    } catch (error) {
      // Handle error
      console.error("Registration error:", error.response ? error.response.data.message : error.message);
      alert(error.response ? error.response.data.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="center-container">
      <div className="container-box">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
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
          <div className="input-group">
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
          <div className="input-group">
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
          <div className="input-group">
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
          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="pet_owner">Pet Owner</option>
              <option value="vet">Veterinarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="login-button">Register</button>
        </form>
        <div className="register-link">
          < p>Already have an account? <a href="login">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;