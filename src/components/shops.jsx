import React from "react";
import { FaSearch, FaMapMarkerAlt, FaFilter } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import "../components/css/shops.css";

function Shops() {
  const navigate = useNavigate(); 

  return (
    <div className="shops-container">
      {/* Search & Filters */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch />
          <input type="text" className="search-bar" placeholder="Search Pet Shops" />
        </div>
        <div className="location-box">
          <FaMapMarkerAlt />
          <select className="location-selector">
            <option>Select Location</option>
          </select>
        </div>
        <div className="filter-box">
          <FaFilter />
          <button className="filter-button">Filters</button>
        </div>
      </div>

      {/* Pet Shops List */}
      <div className="shops-list">
        {[1, 2, 3, 4, 5, 6].map((shop, index) => (
          <div key={index} className="shop-card">
            <div className="shop-info">
              <img src="https://via.placeholder.com/50" alt="Shop Logo" className="shop-logo" />
              <div>
                <h3>Pet Shop Name {shop}</h3>
                <p>🐶 Pet Supplies | 🏥 Veterinary | 🛁 Grooming</p>
                <p className="availability">✔ Open Now | ❌ No In-Person Visit</p>
              </div>
            </div>
            <div className="shop-schedule">
              <p>📅 Earliest Available Schedule</p>
              <p>🕘 Today, 08:00 AM - 08:00 PM</p>
              <p>💲 Fee: P250.00</p>
            </div>
            <div className="shop-actions">
              <a href="/petshop" className="book-button">BOOK APPOINTMENT</a>

              <button className="profile-button" onClick={() => navigate("/shopprofile")}>
                VIEW PROFILE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shops;
