import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to get query parameters
import { Navigation } from "./navigation";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import "../components/css/shopprofile.css"; // Import CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./utils/auth"

function ShopProfile() {
  const { ownerId } = useAuth();
  const location = useLocation(); // Get the current location
  const queryParams = new URLSearchParams(location.search); // Create URLSearchParams object
  const clinicId = queryParams.get('id'); // Get the clinicId from the query parameters
  const navigate = useNavigate();
  const [shop, setShop] = useState(null); // State for shop data
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setShop(response.data); // Save the fetched data
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      fetchShop();
    }
  }, [clinicId]);

  if (loading) {
    return <p>Loading shop details...</p>;
  }

  if (!shop) {
    return <p>Shop not found.</p>;
  }

  const handleBookAppointment = (shopId) => {
    if (ownerId) {
        navigate(`/petshop?id=${shopId}`); // Use & to separate parameters
    } else {
        navigate(`/petshop?id=${shopId}&guest=true`); // Use & to separate parameters
    }
};

  console.log("Fetched shop data:", shop);

  return (
    <div className="page-container">
      <Navigation />
      <div className="grid-container">
        {/* Left Section - Shop Info */}
        <div className="shop-info">
          <div className="shop-header">
            <img 
              src={shop.logo ? `http://localhost:5000${shop.logo}` : '/path/to/default/logo.png'} 
              alt="Shop Logo" 
              className="shop-logo" 
            />
            <div className="shop-details">
              <h2 className="shop-name">{shop.name}</h2>
              <p className="shop-specialty">
                Specialty: {shop.services?.map(service => service.service_name).join(" | ") || "N/A"}
              </p>
              <p className="shop-description">{shop.description || "No description available."}</p>
            </div>
          </div>
          
        </div>

        {/* Right Section - Earliest Available Schedule */}
        <div className="booking-container">
          <h3 className="section-title">Daily Clinic Hours</h3>
          <div className="booking-info">
            <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
            <div className="shop-schedule2">
              <p>Schedule: {shop.days || "N/A"}</p>
              <p>{shop.open_time || "N/A"} - {shop.close_time || "N/A"}</p>
            </div>
          </div>
          <button 
                    onClick={() => handleBookAppointment(shop._id)}
                    className="book-button-profile">
                    BOOK APPOINTMENT
                  </button>
        </div>

        {/* Shop Information Section */}
        <div className="shop-info-container">
  <h3 className="section-title">Clinic Location</h3>
  <div className="map-container">
    <iframe
      width="100%"
      height="350"
      frameBorder="0"
      style={{ border: 0, borderRadius: "8px" }}
      src={`https://www.google.com/maps?q=${encodeURIComponent(shop.address)}&output=embed`}
      allowFullScreen
    ></iframe>
  </div>
  
  {/* Get Directions Button */}
  <button 
    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.address)}`, "_blank")}
    className="directions-button"
  >
    Get Directions
  </button>
</div>

        {/* Shop Information (Now in Wide Container) */}
        <div className="wide-map">
          <h3 className="section-title">Shop Information</h3>
          <p className="shop-contact">
            <strong>Contact:</strong> {shop.contact_number || "N/A"}
          </p>
          <p className="shop-location">
            <strong>Location:</strong> {shop.address || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShopProfile;