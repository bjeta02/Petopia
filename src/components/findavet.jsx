import React from 'react';
import "../components/css/findavet.css";

function Findavet() {
  return (
    <div className="bg-img">
      <div className="findavet-container">
        <div className="appointment-subheading">
          <p>FIND A VET</p>
        </div>
        <h1 className="appointment-heading">
          Book an Appointment, 
          <span className="periwinkle"> online!</span>
        </h1>
        <div className="search-box-container">
        <div className="search-icon">
            <i className="fas fa-search"></i> 
          </div>
          <input 
            type="text" 
            className="search-box" 
            placeholder="Search for a vet..." 
          />
        </div>
        <a href="/shops" className="browse-shop">
          <p>Browse Shops</p>
        </a>
        <div className="invisible-box">
          <div className="text-container">
            <h1>Looking for immediate pet medical assistance?</h1>
            <p>Look for the vet that suits your pet's needs.</p>
          </div>
          <div className="box-logo"></div>
        </div>
      </div>
    </div>
  );
}

export default Findavet;
