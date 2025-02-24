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
  const [searchQuery, setSearchQuery] = useState("");  // Search query state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");  // Debounced search query
  const navigate = useNavigate();

  // Debounce logic to delay API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery); // Set the debounced search query
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer); // Cleanup the timeout if the component unmounts or the query changes
  }, [searchQuery]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://172.20.10.12:5000/api/clinics", {
          params: {
            location: selectedLocation,
            service: selectedService,
            search: debouncedSearchQuery,  // Include the search query
          }
        });

        // Filter out inactive shops
        const activeShops = response.data.clinics.filter(shop => shop.status !== "inactive");

        setShops(activeShops);
        setLocations(response.data.locations);
        setServices(response.data.services);
      } catch (error) {
        console.error("Error fetching pet shops:", error);
      }
    };

    fetchShops();
  }, [selectedLocation, selectedService, debouncedSearchQuery]);

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
  
    const parseDaysRange = (days) => {
      if (!days || typeof days !== "string") {
        console.warn("Invalid or missing days field:", days);
        return [];
      }
    
      const range = days.toLowerCase().split(" to ");
      if (range.length === 2 && daysMap[range[0]] !== undefined && daysMap[range[1]] !== undefined) {
        const start = daysMap[range[0]];
        const end = daysMap[range[1]];
        return Object.keys(daysMap).filter(day => daysMap[day] >= start && daysMap[day] <= end);
      }
      return [days.toLowerCase()];
    };
    
  
    const openDays = parseDaysRange(shop.days); // Extract valid days
  
    const parseTime = (timeStr) => {
      if (!timeStr || typeof timeStr !== "string") {
        console.warn("Invalid or missing time string:", timeStr);
        return null;
      }
    
      const [time, modifier] = timeStr.split(" "); // Split time and AM/PM
      let [hour, minute] = time.split(":").map(Number);
    
      if (modifier === "PM" && hour !== 12) hour += 12;
      if (modifier === "AM" && hour === 12) hour = 0;
    
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
    <div className="shops-container">
      {/* Search & Filters */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            className="search-bar"
            placeholder="Search Pet Shops"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}  // Update search query as user types
          />
        </div>
        <div className="location-box">
          <FaMapMarkerAlt />
          <select
            className="location-selector"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)} // Update location
          >
            <option value="">Location</option>
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
            <option value="">Services</option>
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
                  src={`http://172.20.10.12:5000/logos/logo_${shop._id}.jpg`}  // Fetch the logo dynamically
                  className="shop-logo" 
                />
                <div>
                  <h3>{shop.name}</h3>
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
                </div>
              </div>
              <div className="shop-schedule">
                <p>📅 Schedule: {shop.days}</p>
                <p>🕘 {shop.open_time} - {shop.close_time}</p>
                <p className="availability">
                      <span className={`status-indicator ${checkIfOpen(shop) ? "open" : "closed"}`}>
                        {checkIfOpen(shop) ? "🟢 OPEN" : "🔴 CLOSED"}
                      </span>
                    </p>
              </div>
              <div className="shop-actions">
                <button 
                  onClick={() => navigate(`/petshop/${shop._id}`)}
                  className="book-button">
                  BOOK APPOINTMENT
                </button>
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