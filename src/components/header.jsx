import React from "react";
import { Link } from 'react-router-dom';

export const Header = (props) => {
  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <h1>
                  Purr-fect Appointment!
                </h1>
                <p>Just Clicks Away!</p>
              
                <Link to="/findavet" className="btn btn-custom btn-lg page-scroll">
                  Book an Appointment
                </Link>



              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
