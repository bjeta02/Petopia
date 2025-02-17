import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Get ID from URL
import axios from "axios"; // Import Axios
import "../components/css/shopprofile.css"; // Import CSS

function ShopProfile() {
  const { id } = useParams(); // Get the shop ID from the URL
  const [shop, setShop] = useState(null); // State for shop data
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clinics/${id}`);
        setShop(response.data); // Save the fetched data
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  if (loading) {
    return <p>Loading shop details...</p>;
  }

  if (!shop) {
    return <p>Shop not found.</p>;
  }

  return (
    <div className="page-container">
      <div className="grid-container">
        {/* Left Section - Shop Info */}
        <div className="shop-info">
          <div className="shop-header">
            <img src={shop.image || "/shop-image.jpg"} alt="Shop Logo" className="shop-logo" />
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
            <img src="/calendar-icon.png" alt="Schedule" className="icon" />
            <div>
              <p className="schedule-time">
                Today, {shop.open_time} - {shop.close_time}
              </p>
              <p className="schedule-fee">Fee: ₱{shop.fee || "N/A"}</p>
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
