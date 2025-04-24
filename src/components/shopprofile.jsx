import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useAuth } from "./utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faEnvelope, faMapMarkerAlt, faClock, faPhone } from "@fortawesome/free-solid-svg-icons";
import "./css/profileclinic.css"

function ShopProfile() {
  const { ownerId } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clinicId = queryParams.get("id");
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false); // State for showing more services

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setShop(response.data);
      } catch (error) {
        console.error("Error fetching clinic details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) fetchShop();
  }, [clinicId]);

  console.log(shop);

  const handleBookAppointment = () => {
    if (ownerId) {
      navigate(`/petshop?id=${shop._id}`);
    } else {
      navigate(`/petshop?id=${shop._id}&guest=true`);
    }
  };

  if (loading) return <p>Loading clinic details...</p>;
  if (!shop) return <p>Clinic not found.</p>;

  const formatTimeTo12Hour = (time) => {
    const [hour, minute] = time.split(':');
    const hourIn12 = hour % 12 || 12; // Convert to 12-hour format
    const ampm = hour < 12 ? 'AM - ' : 'PM'; // Determine AM/PM
    return `${hourIn12}:${minute} ${ampm}`;
  };

  return (
    <div className="p-4">
      <Card className="shop-profile-card">
        <div className="shop-main-section">
          {/* Left Side: Logo & Info */}
          <div className="profile-shop-left">
            <div className="shop-profile-header">
              <img
                src={shop.logo ? `http://localhost:5000${shop.logo}` : "/placeholder.png"}
                alt="Clinic Logo"
                className="shop-profile-logo"
              />
              <div className="shop-profile-details">
                <h1>{shop.name}</h1>
                <p className="profile-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                  {shop.address || "N/A"}
                </p>  
                <p className="profile-icon">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" />
                  {shop.email || "N/A"}
                </p>
                <p className="profile-icon">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-500" />
                  {shop.contact_number || "N/A"}
                </p>
      
              </div>
            </div>

            {/* New Description Section */}
            <div className="shop-profile-description">
              <h1>Description</h1>
                <ul className="shop-description-list">
                  {(shop.description || "No description provided.")
                    .split('.')
                    .filter(sentence => sentence.trim() !== '')
                    .map((sentence, index) => (
                      <li key={index}>{sentence.trim()}.</li>
                    ))}
                </ul>
            </div>

            <div className="shop-services-section">
              <h1>Services List</h1>
              <div className="services-table">
                {shop.services && shop.services.length > 0 ? (
                  shop.services.slice(0, showMore ? shop.services.length : 5).map((service, index) => (
                    <div key={index} className=" service-row">
                      <span className="service-name">{service.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No services available.</p>
                )}
              </div>
              {shop.services.length > 5 && (
                <Button onClick={() => setShowMore(!showMore)} className="see-more-button">
                  {showMore ? "See Less" : "See More"}
                </Button>
              )}
            </div>
          </div>

          {/* Right Side: Map */}
          <div className="profile-shop-right">
            <div className=" profile-map-container">
            <h1> Clinic Location</h1>
            <iframe
              title="clinic-map"
              frameBorder="0"
              src={`https://www.google.com/maps?q=${encodeURIComponent(shop.address)}&output=embed`}
              allowFullScreen
            ></iframe>
            <Button
              label="Get Directions"
              icon="pi pi-directions"
              className="mt-3 profile-map-button"
              onClick={() =>
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.address)}`, "_blank")
              }
            />
            </div>

            <div className="booking-container">
              <h3 className="section-title">Operating hours</h3>
              <div className="booking-info">
                <FontAwesomeIcon icon={faClock} className="icon" />
                <div className="shop-schedule2">
                  <p>We're open at: {shop.days || "N/A"}</p>
                  <p>
                    {formatTimeTo12Hour(shop.open_time) || "N/A"} 
                    {formatTimeTo12Hour(shop.close_time) || "N/A"}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => handleBookAppointment(shop._id)}
                className="book-button-profile"
              >
                Book an Appointment Now -&gt;
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ShopProfile;
