import React from "react";
import "../components/css/landing.css"; // Import the CSS for styling
import { useNavigate } from 'react-router-dom';
import { Navigation } from "./navigation";

const LandingPage = () => {

    const navigate = useNavigate();

    const handleClinicClick = () => {
      navigate('/clinic/dashboard'); // Redirect to the dashboard page

    };

    const handlePatientClick = () => {
      navigate('/home'); // Redirect to the dashboard page

    };

  return (
    <div className="landing-page">
      <Navigation />
      <div className="which-container">
        <h1 className="title">Which one are you?</h1>
        <div className="options">
          <div className="option">  
            <div className="icon">🩺</div>
            <button className="button-landing" onClick={handleClinicClick}>I'm a Vet</button>
          </div>
          <div className="separator"></div>
          <div className="option">
            <div className="icon">🐾</div>
            <button className="button-landing" onClick={handlePatientClick}>Patient</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;