import React, { useEffect, useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaFilter } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../components/css/shops.css";

function Shops() {
  const [shops, setShops] = useState([]); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clinics");
        setShops(response.data); 
      } catch (error) {
        console.error("Error fetching pet shops:", error);
      }
    };
    fetchShops();
  }, []);

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
        {shops.length > 0 ? (
          shops.map((shop) => (
            <div key={shop._id} className="shop-card">
              <div className="shop-info">
                <img
                  src="https://via.placeholder.com/50"
                  alt="Shop Logo"
                  className="shop-logo"
                />
                <div>
                  <h3>{shop.name}</h3>
                  <p>{shop.description}</p>

                  <p>
                    {/* Display Services */}
                      {shop.services && shop.services.length > 0 && (
                        <p>
                          {shop.services.slice(0, 3).map((service, index) => (
                            <span key={index}>
                              {index > 0 && " | "} {service} {/* Add separator if multiple services */}
                            </span> 
                          ))}
                          {shop.services.length > 3 && " | More..."} {/* Show 'More...' if >3 services */}
                        </p>
                      )}
                  </p>

                  <p className="availability">✔ Open Now | ❌ No In-Person Visit</p>
                </div>
              </div>
              <div className="shop-schedule">
                <p>📅 Available Schedule: {shop.days}</p>
                <p>🕘 {shop.open_time} - {shop.close_time}</p>
              </div>
              <div className="shop-actions">
                <a href="/petshop" className="book-button">BOOK APPOINTMENT</a>
                <button className="profile-button" onClick={() => navigate("/shopprofile")}>
                  VIEW PROFILE
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading pet shops...</p>
        )}
      </div>
    </div>
  );
}

export default Shops;
