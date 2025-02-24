import React from "react";
import { Link } from "react-router-dom";
import "../components/css/header.css";

export const Header = (props) => {
  return (
    <header id="header" className="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="intro-text">
              <h1>Purr-fect Appointment!</h1>
              <p>Just Clicks Away!</p>
              <Link to="/findavet" className="btn btn-custom btn-lg page-scroll">
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
