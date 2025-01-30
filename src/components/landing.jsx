import React from "react";
import "../components/css/landing.css"; // Import the CSS for styling
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {

    const navigate = useNavigate();

    const handlePatientClick = () => {
      navigate('/home'); // Redirect to the dashboard page

    };

  return (
    <div className="landing-page">
      <div className="which-container">
        <h1 className="title">Which one are you?</h1>
        <div className="options">
          <div className="option">
            <div className="icon">🩺</div>
            <button className="button">I'm a Vet</button>
          </div>
          <div className="separator"></div>
          <div className="option">
            <div className="icon">🐾</div>
            <button className="button" onClick={handlePatientClick}>I'm a Patient</button>
            <h6>looking for a vet</h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
