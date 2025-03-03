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
  const [userLocation, setUserLocation] = useState(null); // State for user's location

  // Debounce logic to delay API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery); // Set the debounced search query
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer); // Cleanup the timeout if the component unmounts or the query changes
  }, [searchQuery]);

  // Get user's current location
useEffect(() => {
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log(`Location found: Lat ${position.coords.latitude}, Lng ${position.coords.longitude}`);
        },
        (error) => {
          console.error("Error getti  ng location:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("Location access denied. Enable location services or allow location permissions in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("Location request timed out. Try again.");
              break;
            default:
              alert("An unknown error occurred while retrieving location.");
          }
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  getUserLocation();
}, []);


  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clinics", {
          params: {
            location: selectedLocation,
            service: selectedService,
            search: debouncedSearchQuery,  // Include the search query
          }
        });

        // Handle successful response
        console.log("Shops response:", response.data);
        const { clinics, locations, services } = response.data; // Destructure response data

        // Filter out inactive shops
        const activeShops = clinics.filter(shop => shop.status !== "inactive");

        // Calculate distances and sort shops
        const shopsWithDistance = await Promise.all(activeShops.map(async (shop) => {
          if (shop.latitude && shop.longitude) {
            const distance = calculateDistance(userLocation, {
              latitude: shop.latitude,
              longitude: shop.longitude,
            });
            return { ...shop, distance };
          } else {
            // Geocode the address if latitude and longitude are not available
            try {
              const clinicLocation = await geocodeAddress(shop.address);
              const distance = calculateDistance(userLocation, clinicLocation);
              return { ...shop, distance };
            } catch (error) {
              console.error("Error geocoding address:", error);
              return { ...shop, distance: Infinity }; // Set distance to Infinity if geocoding fails
            }
          }
        }));

        shopsWithDistance.sort((a, b) => a.distance - b.distance); // Sort by distance

        // Update state with fetched data
        setShops(shopsWithDistance);
        setLocations(locations);
        setServices(services);
      } catch (error) {
        console.error("Error fetching pet shops:", error);
      }
    };

    if (userLocation) {
      fetchShops();
    }
  }, [selectedLocation, selectedService, debouncedSearchQuery, userLocation]);

  const geocodeAddress = async (address) => {
    const apiKey = process.env.REACT_APP_API_KEY; // Your OpenCage API key
    console.log("Using API Key:", apiKey); // Log the API key (for debugging only)
    
    if (!apiKey) {
      throw new Error("API key is not defined. Please check your .env file.");
    }
  
    console.log("Geocoding address:", address); // Log the address
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: address,
          key: apiKey,
        },
      });
  
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        console.error("Geocoding failed: No results found for address:", address);
        throw new Error("Geocoding failed: No results found.");
      }
    } catch (error) {
      console.error("Error geocoding address:", error.message);
      throw error; // Rethrow the error to handle it in the calling function
    }
  };

  const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2 || isNaN(loc1.latitude) || isNaN(loc1.longitude) || isNaN(loc2.latitude) || isNaN(loc2.longitude)) {
      console.warn("Invalid location for distance calculation:", loc1, loc2);
      return Infinity; // Return a large number if location is not available
    }
  
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
    const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.latitude * (Math.PI / 180)) * Math.cos(loc2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in km
  };

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

    return isOpen;
  };

  const handleBookAppointment = (shopId) => {
    const ownerId = localStorage.getItem('ownerId'); // Check if owner is logged in
    if (ownerId) {
        navigate(`/petshop?id=${shopId}&ownerId=${ownerId}`); // Use & to separate parameters
    } else {
        navigate(`/petshop?id=${shopId}&guest=true`); // Use & to separate parameters
    }
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
                  src={`http://localhost:5000${shop.logo}`}  // Fetch the logo dynamically
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
                <p>📍 Distance: {shop.distance !== undefined ? shop.distance.toFixed(2) + " km" : "Location not available"}</p>
              </div>
              <div className="shop-actions">
                  <button 
                    onClick={() => handleBookAppointment(shop._id)}
                    className="book-button">
                    BOOK APPOINTMENT
                  </button>
                <button
                  className="profile-button"
                  onClick={() => navigate(`/shopprofile?id=${shop._id}`)}
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