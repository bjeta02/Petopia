import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from "./navigation";
import axios from 'axios';
import "../components/css/findavet.css";

function Findavet() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted
  
    // Fetch available services from the backend
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/services"); // Assuming an endpoint for services
        if (isMounted) { // Only update state if component is still mounted
          const uniqueServices = [...new Set(response.data.map(service => service.name))]; // Remove duplicates
          setServices(uniqueServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
  
    fetchServices();
  
    // Cleanup function to set the flag to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts
  
  

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowDropdown(false); // Hide dropdown when a service is selected
    navigate(`/shops?service=${service}`); // Navigate to the shops page with the selected service
  };

  const handleInputFocus = () => {
    setShowDropdown(true); // Show dropdown when input is focused
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 100); // Hide dropdown with a small delay to allow clicking on options
  };

  return (
    <div>
    <Navigation />
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

          {/* Input Box for Search */}
          <input
            type="text"
            className="search-box"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)} // Update service on input change
            onFocus={handleInputFocus} // Show dropdown when input is focused
            onBlur={handleInputBlur} // Hide dropdown when input loses focus
            placeholder="Search for a service..."
          />

          {/* Dropdown list of services */}
          {showDropdown && (
            <div className="dropdown">
              {services.filter(service => service.toLowerCase().includes(selectedService.toLowerCase())).map((service, index) => (
                <div 
                  key={index} 
                  className="dropdown-item"
                  onClick={() => handleServiceSelect(service)} // Select a service on click
                >
                  {service}
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
}

export default Findavet;