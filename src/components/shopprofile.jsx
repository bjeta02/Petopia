import React from "react";
import "../components/css/shopprofile.css"; // Import CSS

function ShopProfile() {
  return (
    <div className="page-container">
      <div className="grid-container">
        {/* Left Section - Shop Info */}
        <div className="shop-info">
            <div className="shop-header">
                <img src="/shop-image.jpg" alt="Shop Logo" className="shop-logo" />
                <div className="shop-details"> {/* New wrapper for details */}
                    <h2 className="shop-name">Pet Haven</h2>
                    <p className="shop-specialty">Specialty: Grooming & Veterinary</p>
                    <p className="shop-experience">Experience: 5 Years</p>
                </div>
            </div>
  {/* Move description outside shop-header */}
  <p className="shop-description">
    Welcome to our pet shop! We offer top-quality grooming and veterinary services.
  </p>
</div>


        {/* Right Section - Earliest Available Schedule */}
        <div className="booking-container">
          <h3 className="section-title">Daily Clinic Hours</h3>
          <div className="booking-info">
            <img src="/calendar-icon.png" alt="Schedule" className="icon" />
            <div>
              <p className="schedule-time">Today, 9:00 AM - 5:00 PM</p>
              <p className="schedule-fee">Fee: ₱500</p>
            </div>
          </div>
          <button className="book-button-profile">BOOK HERE</button>
        </div>

        {/* Shop Information Section */}
        <div className="shop-info-container">
        <h3 className="section-title">Shop Information</h3>
            <div className="shop-info-container2">    
                <p className="shop-location"><strong>Location:</strong> 123 Pet Street, Iligan City</p>
                <p className="shop-contact"><strong>Contact:</strong> (0912) 345-6789</p>
                <p className="shop-hours"><strong>Operating Hours:</strong> Monday - Sunday, 9:00 AM - 5:00 PM</p>
            </div>
        </div>

        
      </div>
    </div>
  );
}

export default ShopProfile;
