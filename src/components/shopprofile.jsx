import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Get ID from URL
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import "../components/css/shopprofile.css"; // Import CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";


function ShopProfile() {
  const { clinicId } = useParams(); // Get the shop ID from the URL
  const [shop, setShop] = useState(null); // State for shop data
  const [loading, setLoading] = useState(true); // State for loading
  const navigate = useNavigate();

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
    fetchShop();
  }, [clinicId]);

  if (loading) {
    return <p>Loading shop details...</p>;
  }

  if (!shop) {
    return <p>Shop not found.</p>;
  }

  const checkIfOpen = () => {
    const now = new Date();
    const currentDay = now.toLocaleString("en-US", { weekday: "long" }).toLowerCase(); // e.g., "monday"
    const currentHour = now.getHours(); // 24-hour format
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute; // Convert to comparable format (e.g., 14:30 -> 1430)

    // Map day names to numbers
    const daysMap = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    };

    // Convert "Monday to Friday" into a list of days
    const parseDaysRange = (days) => {
      if (!days) return []; // Return an empty array if days is not defined
      const range = days.toLowerCase().split(" to ");
      if (range.length === 2 && daysMap[range[0]] !== undefined && daysMap[range[1]] !== undefined) {
        const start = daysMap[range[0]];
        const end = daysMap[range[1]];
        return Object.keys(daysMap).filter(day => daysMap[day] >= start && daysMap[day] <= end);
      }
      return [days.toLowerCase()];
    };

    const openDays = parseDaysRange(shop.days); // Extract valid days

    // Convert "8:00 AM" / "5:00 PM" to 24-hour format (e.g., "08:00 AM" -> 800, "5:00 PM" -> 1700)
    const parseTime = (timeStr) => {
      if (!timeStr) return 0; // Return a default value if timeStr is not defined
      const [time, modifier] = timeStr.split(" "); // Split time and AM/PM
      let [hour, minute] = time.split(":").map(Number);

      if (modifier === "PM" && hour !== 12) hour += 12; // Convert PM times
      if (modifier === "AM" && hour === 12) hour = 0; // Midnight case

      return hour * 100 + minute;
    };

    const openTime = parseTime(shop.open_time);
    const closeTime = parseTime(shop.close_time);

    // Check if today is within open days and within time range
    const isOpen = openDays.includes(currentDay) && currentTime >= openTime && currentTime <= closeTime;
    return isOpen;
  };

  const handleBookAppointment = (clinicId) => {
    const ownerId = localStorage.getItem('ownerId'); // Check if owner is logged in
    if (ownerId) {
      navigate(`/petshop/${clinicId}?ownerId=${ownerId}`); // Navigate with ownerId
    } else {
      navigate(`/petshop/${clinicId}?guest=true`); // Navigate as guest
    }
  };

  console.log("Fetched shop data:", shop);

  return (
    <div className="page-container">
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
              <p className="shop-experience">Experience: {shop.experience || "N/A"} Years</p>
            </div>
          </div>
          <p className="shop-description">{shop.description || "No description available."}</p>
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
  
        {/* Clinic Location - Now inside a container */}
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