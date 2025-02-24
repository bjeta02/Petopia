  import React, { useState, useEffect } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import axios from "axios";
  import "../components/css/petshop.css";

  function PetShop() {
    const { clinicId } = useParams();  // Get the clinic_id from the URL
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");   // Owner's email
    const [phone, setPhone] = useState("");   // Owner's phone
    const [address, setAddress] = useState("");  // Owner's address
    const [petName, setPetName] = useState("");
    const [petType, setPetType] = useState("");
    const [petBreed, setPetBreed] = useState("");
    const [petAge, setPetAge] = useState("");
    const [petGender, setPetGender] = useState("");
    const [services, setServices] = useState([]);  // Store services
    const [selectedService, setSelectedService] = useState("");  // Store selected service
    const [clinic, setClinic] = useState(null);  // Store clinic data
    const navigate = useNavigate();

    // Fetch clinic and services from backend when component loads
    useEffect(() => {
      const fetchClinicData = async () => {
        console.log("clinicId from useParams:", clinicId); // Check the value of clinicId
        if (!clinicId) {
          console.error("Clinic ID is undefined");
          return;
        }

        try {
          // Fetch clinic details
          const clinicResponse = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
          setClinic(clinicResponse.data);

          // Fetch services for the clinic
          const servicesResponse = await axios.get(`http://localhost:5000/api/services/clinic/${clinicId}`);
          setServices(servicesResponse.data);
        } catch (error) {
          console.error("Error fetching clinic or services:", error);
        }
      };

      fetchClinicData();
    }, [clinicId]);

    const handleSubmit = async () => {
      // Check if all fields are valid
      if (!name || !email || !phone || !address) {
        alert("All fields are required!");
        return;
      }
    
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
    
      // Proceed with the submission if validation passes
      try {
        const ownerResponse = await axios.post("http://localhost:5000/api/owners/register", {
          name,
          email,
          phone,
          address,
        });
    
        // Continue with creating pet and appointment
        const petResponse = await axios.post("http://localhost:5000/api/pets/register", {
          owner_id: ownerResponse.data._id,
          name: petName,
          type: petType,
          breed: petBreed,
          age: petAge,
          gender: petGender,
        });
    
        const appointmentData = {
          clinic_id: clinicId,
          date: selectedDate,
          owner_id: ownerResponse.data._id,
          pet_id: petResponse.data._id,
          service_id: selectedService,
          notes: "Some notes",
        };
        
        const appointmentResponse = await axios.post("http://localhost:5000/api/appointments/create", appointmentData);
    
          alert("Appointment booked successfully!");
          navigate(`/appointments`);
      } catch (error) {
        console.error("Error creating appointment:", error.response ? error.response.data : error.message);
        alert("An error occurred while booking the appointment.");
      }
    };
    
    

    return (
      <div className="page-container">
        <div className="petshop-container">
          {/* Left Section - Pet Shop Info */}
          {clinic && (
            <div className="shop-info">
              <h2>{clinic.name}</h2>
              <p>
                {clinic.services && clinic.services.length > 0 ? (
                  clinic.services.map((service, index) => (
                    <span key={service.service_id}> {/* Use service_id as the key */}
                      {index > 0 && " | "} {service.service_name} {/* Access service_name */}
                    </span>
                  ))
                ) : (
                  <span>No services available</span>
                )}
                {clinic.services && clinic.services.length > 3 && " | More..."}
              </p>
            </div>
          )}
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
                {/* Service Dropdown */}
                <select 
                  className="input-field"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}  {/* Change service display */}
                    </option>
                  ))}
                </select>

                <button className="action-button" onClick={() => setStep(3)}>CONTINUE</button>
              </>
            )}

            {/* Step 3: Pet & Owner Details */}
            {step === 3 && (
              <>
                <button className="back-button" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <h3>Pet & Owner Details</h3>
                <p>Please provide information about yourself and your pet.</p>

                <label className="form-label">Owner Name *</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />

                <label className="form-label">Owner Email *</label>
                <input 
                  type="email" 
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="form-label">Owner Phone *</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <label className="form-label">Owner Address *</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <label className="form-label">Pet Name *</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required 
                />

                <label className="form-label">Pet Type *</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  required
                />

                <label className="form-label">Pet Breed (Optional)</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                />
                
                <label className="form-label">Pet Gender *</label>
                <div className="gender-options">
                  <button 
                    type="button"
                    className={petGender === "Male" ? "selected" : ""}
                    onClick={() => setPetGender("Male")}
                  >
                    Male
                  </button>
                  <button 
                    type="button"
                    className={petGender === "Female" ? "selected" : ""}
                    onClick={() => setPetGender("Female")}
                  >
                    Female
                  </button>
                </div>

                <label className="form-label">Pet Age (Optional)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                />

                <button className="action-button" onClick={handleSubmit}>SUBMIT</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  export default PetShop;
