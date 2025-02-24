import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Get ID from URL
import axios from "axios"; // Import Axios
import "../components/css/shopprofile.css"; // Import CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

function ShopProfile() {
  const { clinicId } = useParams(); // Get the shop ID from the URL
  const [shop, setShop] = useState(null); // State for shop data
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get(`http://172.20.10.12:5000/api/clinics/${clinicId}`);
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
  
  const checkIfOpen = (shop) => {
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

    console.log(`Checking shop: ${shop.name}`);
    console.log(`Current Day: ${currentDay}`);
    console.log(`Open Days: ${openDays}`);
    console.log(`Current Time: ${currentTime}`);
    console.log(`Open Time: ${openTime} | Close Time: ${closeTime}`);
    console.log(`Is Open? ${isOpen ? "YES" : "NO"}`);

  
    return isOpen;
  };  

  return (
    <div className="page-container">
      <div className="grid-container">
        {/* Left Section - Shop Info */}
        <div className="shop-info">
          <div className="shop-header">
            <img src={`http://172.20.10.12:5000/logos/logo_${shop._id}.jpg`} alt="Shop Logo" className="shop-logo" />
            <div className="shop-details">
              <h2 className="shop-name">{shop.name}</h2>
              <p className="shop-specialty">
                Specialty: {shop.services?.map(service => service.service_name).join(" | ") || "N/A"}
              </p>
              <p className="shop-experience">Experience: {shop.experience || "N/A"} Years</p>
            </div>
          </div>
          <p className="shop-description">{shop.description}</p>
        </div>

        {/* Right Section - Earliest Available Schedule */}
        <div className="booking-container">
          <h3 className="section-title">Daily Clinic Hours</h3>
          <div className="booking-info">
          <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
          <div className="shop-schedule2">
                <p> Schedule: {shop.days}</p>
                <p> {shop.open_time} - {shop.close_time}</p>
                <p className="availability">
                      <span className={`status-indicator ${checkIfOpen(shop) ? "open" : "closed"}`}>
                        {checkIfOpen(shop) ? "🟢 OPEN" : "🔴 CLOSED"}
                      </span>
                    </p>
              </div>
          </div>
          <button className="book-button-profile">BOOK HERE</button>
        </div>

        {/* Shop Information Section */}
        <div className="shop-info-container">
          <h3 className="section-title">Shop Information</h3>
          <div className="shop-info-container2">
            <p className="shop-location">
              <strong>Location:</strong> {shop.address}
            </p>
            <p className="shop-contact">
              <strong>Contact:</strong> {shop.contact_number}
            </p>
            <p className="shop-hours">
              <strong>Operating Hours:</strong> {shop.days}, {shop.open_time} - {shop.close_time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopProfile;
