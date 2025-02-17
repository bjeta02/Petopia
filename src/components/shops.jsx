import React, { useEffect, useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/shops.css";

function Shops() {
  const [shops, setShops] = useState([]);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clinics", {
          params: {
            location: selectedLocation,
            service: selectedService
          }
        });

        setShops(response.data.clinics);
        setLocations(response.data.locations);
        setServices(response.data.services);
      } catch (error) {
        console.error("Error fetching pet shops:", error);
      }
    };

    fetchShops();
  }, [selectedLocation, selectedService]); // Refetch data when filters change

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
          <select
            className="location-selector"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)} // Update location
          >
            <option value="">Select Location</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <FaFilter />
          <select
            className="filter-button"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)} // Update selected service
          >
            <option value="">Select Service</option>
            {services.map((service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            ))}
          </select>
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
                    {shop.services &&
                      shop.services.length > 0 &&
                      shop.services.slice(0, 3).map((service, index) => (
                        <span key={index}>
                          {index > 0 && " | "} {service}
                        </span>
                      ))}
                    {shop.services.length > 3 && " | More..."}
                  </p>
                  <p className="availability">✔ Open Now | ❌ No In-Person Visit</p>
                </div>
              </div>
              <div className="shop-schedule">
                <p>📅 Available Schedule: {shop.days}</p>
                <p>🕘 {shop.open_time} - {shop.close_time}</p>
              </div>
              <div className="shop-actions">
                <a 
                  onClick={() => navigate(`/petshop/${shop._id}`)}
                  className="book-button">
                  BOOK APPOINTMENT
                </a>
                <button
                  className="profile-button"
                  onClick={() => navigate(`/shopprofile/${shop._id}`)}
                >
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
