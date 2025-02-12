import React, { useState } from "react";
import "../components/css/petshop.css";

function PetShop() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");

  return (
    <div className="page-container">
      <div className="petshop-container">
        {/* Left Section - Pet Shop Info */}
        <div className="shop-info">
          <h2>Pet Haven</h2>
          <p>Quality care for your pets, anytime.</p>
        </div>

        {/* Right Section - Multi-Step Form */}
        <div className="form-container">
          {/* Step Indicator */}
          <div className="step-indicator">
            <span className={step === 1 ? "step active" : "step"}>1</span>
            <span className={step === 2 ? "step active" : "step"}>2</span>
            <span className={step === 3 ? "step active" : "step"}>3</span>
          </div>

          {/* Step 1: Choose Customer Type */}
          {step === 1 && (
            <>
              <h3>Welcome!</h3>
              <p>To book a service, please provide your details.</p>
              <button className="action-button" onClick={() => setStep(2)}>
                I'm a Returning Customer
              </button>
              <button className="action-button" onClick={() => setStep(2)}>
                I'm a New Customer
              </button>
            </>
          )}

          {/* Step 2: Booking Form */}
          {step === 2 && (
            <>
              <button className="back-button" onClick={() => setStep(1)}>
                ← Back
              </button>
              <h3>Appointment Details</h3>

              <p><strong>Store hours: 9:00 AM - 5:00 PM</strong></p>

              <label className="form-label">SCHEDULED ON</label>
              <input 
                type="date" 
                className="date-picker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <label className="form-label">REASON FOR BOOKING/CHIEF COMPLAINT</label>
              <input type="text" className="input-field" placeholder="Enter reason" />

              <button className="action-button" onClick={() => setStep(3)}>CONTINUE</button>
            </>
          )}

          {/* Step 3: Pet Details */}
          {step === 3 && (
            <>
              <button className="back-button" onClick={() => setStep(2)}>
                ← Back
              </button>
              <h3>Pet Details</h3>
              <p>Please provide information about your pet.</p>

              <label className="form-label">Name *</label>
              <input 
                type="text" 
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />

              <label className="form-label">Pet Type *</label>
              <input 
                type="text" 
                className="input-field"
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
                placeholder="e.g., Dog, Cat, Rabbit"
                required
              />

              <label className="form-label">Breed (Optional)</label>
              <input 
                type="text" 
                className="input-field"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Golden Retriever, Persian Cat"
              />
              
              <label className="form-label">Gender: *</label>
              <div className="gender-options">
                <button 
                  type="button"
                  className={gender === "Male" ? "selected" : ""}
                  onClick={() => setGender("Male")}
                >
                  Male
                </button>
                <button 
                  type="button"
                  className={gender === "Female" ? "selected" : ""}
                  onClick={() => setGender("Female")}
                >
                  Female
                </button>
              </div>

              <label className="form-label">Age (Optional)</label>
              <input 
                type="number" 
                className="input-field"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age in years"
              />

              <label className="form-label">Weight (Optional)</label>
              <input 
                type="text" 
                className="input-field"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight in kg"
              />

              <button className="action-button">SUBMIT</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PetShop;
