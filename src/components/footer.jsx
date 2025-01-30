import React from 'react';
import "../components/css/footer.css";

function Footer() {
  const handleGetStarted = () => {
    const email = document.querySelector(".email-input").value; 
    if (email) {
      window.location.href = `/register?email=${encodeURIComponent(email)}`;
    } else {
      alert("Please enter your email before proceeding.");
    }
  };

  return (
    <div id="footer">
      <div className="container">
        <div className="section-title">
          <h2>Get Started with Petopia!</h2>
          <h4>Manage your pet's health with ease.</h4>
        </div>

        {/* Email Input and Get Started Button */}
        <div className="input-container">
          <input
            type="email"
            placeholder="Enter your email"
            className="email-input"
          />
          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </div>
      <div className="copyright">
            <p>&copy; 2025 Petopia. All rights reserved.</p>
          </div>
    </div>
  );
}

export default Footer;
