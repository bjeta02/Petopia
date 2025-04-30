import React from 'react';
import { Link } from "react-router-dom";
import "../components/css/footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";

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
      <span className="datatable-line" style={{width: '95%', margin: "50px auto"}}></span>
      <div className="footer-about" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="contact-info">
        <h4>Petopia</h4>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Booking Appointments</p>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Vet & Shop Scheduling</p>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Serving Iligan City</p>
      </div>

      <div className="contact-info">
        <h4>Services</h4>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Find a Vet</p>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Pet Shop Directory</p>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Appointment Tracking</p>
      </div>

      <div className="footer-help">
        <h4>Help</h4>
        <Link to="/terms-services" style={{ color: 'lightgray', fontSize: '18px' }}>Terms and Conditions</Link>
        <br />
        <Link to="/privacy-policy" style={{ color: 'lightgray', fontSize: '18px' }}>Privacy Policy</Link>
      </div>

      <div className="contact-info">
        <h4>Contact Us</h4>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Email: petopia144@gmail.com</p>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Phone: 0956-935-3828</p>
        <p style={{ color: 'lightgray', fontSize: '18px', marginBottom: '0px' }}>Location: Iligan City, PH</p>
      </div>

      <div className="contact-info">
        <h4>Follow Us</h4>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'lightgray', fontSize: '24px' }}>
            <FaFacebookF />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'lightgray', fontSize: '24px' }}>
            <FaInstagram />
          </a>
          <a href="mailto:petopia144@gmail.com" style={{ color: 'lightgray', fontSize: '24px' }}>
            <FaEnvelope />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'lightgray', fontSize: '24px' }}>
            <FaTwitter />
          </a>
        </div>
      </div>
    </div>

        <div className="copyright">
          <p>&copy; 2025 Petopia. All rights reserved.</p>
        </div>
    </div>
  );
}

export default Footer;
