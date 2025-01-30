import React from 'react';
import "../components/css/findavet.css";

function Findavet() {
  return (
    <div className="bg-img">
      <div className="findavet-container">
        <h1 className="appointment-subheading">FIND A VET</h1>
        <h1 className="appointment-heading">
          Book an Appointment, 
          <span className="periwinkle"> Online!</span>
        </h1>
        <div className="search-box-container">
          <div className="search-icon">
            <i className="fas fa-search"></i> {/* Font Awesome magnifying glass icon */}
          </div>
          <input 
            type="text" 
            className="search-box" 
            placeholder="Search for a vet..." 
          />
        </div>
        <div className="invisible-box">
          <h1>Looking for immediate pet medical assistance?</h1>
          <div className="box-logo">
          </div>
        </div>
      </div>
    </div>
  );
}

export default Findavet;
