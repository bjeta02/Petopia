import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../components/css/petshop.css";

function PetShop() {
  const { clinicId } = useParams();
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get("ownerId");
  const isGuest = searchParams.get("guest");
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petGender, setPetGender] = useState("");
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [clinic, setClinic] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicData = async () => {
      if (!clinicId) {
        console.error("Clinic ID is undefined");
        return;
      }
      try {
        const clinicResponse = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setClinic(clinicResponse.data);

        const servicesResponse = await axios.get(`http://localhost:5000/api/services/clinic/${clinicId}`);
        setServices(servicesResponse.data);
      } catch (error) {
        console.error("Error fetching clinic or services:", error);
      }
    };

    const fetchOwnerData = async () => {
      if (ownerId && !isGuest) {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const ownerResponse = await axios.get(`http://localhost:5000/api/owners/${ownerId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            setFirstName(`${ownerResponse.data.firstname}`);
            setLastName (`${ownerResponse.data.lastname}`);
            setEmail(ownerResponse.data.email);

            const fetchPets = async () => {
              try {
                const response = await fetch(`http://localhost:5000/api/pets`, {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                if (!response.ok) {
                  throw new Error("Failed to fetch pets");
                }

                const data = await response.json();
                const ownerPets = data.filter((p) => p.owner_id === ownerId);
                setPets(ownerPets);
              } catch (error) {
                console.error("Error fetching pets:", error);
              }
            };

            fetchPets();
          }
        } catch (error) {
          console.error("Error fetching owner or pets:", error);
        }
      }
    };

    fetchClinicData();
    fetchOwnerData();
  }, [clinicId, ownerId, isGuest]);

  const handleSubmit = async () => {
    if (!selectedDate || !petName || !petType || !email) {
      alert("Please fill out all required fields!");
      return;
    }

    try {
      const appointmentData = {
        owner_id: ownerId,
        firstName: isGuest ? firstname : undefined, // Only include for guests
        lastName: isGuest ? lastname : undefined,   // Only include for guests
        email: isGuest ? email : undefined,         // Only include for guests
        petName,
        petType,
        clinic_id: clinicId,
        date: selectedDate,
        service_id: selectedService,
        vet_id: "someVetId", // Replace with actual vet ID if needed
        notes: "Some notes",
      };

      if (isGuest) {
        // If it's a guest appointment, send the data to the backend to handle OTP and registration
        const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
        alert(response.data.message);
        setOtpSent(true);
        setStep(4); // Move to OTP verification step
      } else {
        // If it's a registered owner, create the appointment directly
        const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
        alert("Appointment booked successfully!");
        navigate(`/appointments`);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("An error occurred while booking the appointment.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/appointments/verify-otp", {
        email,
        otp,
      });

      alert(response.data.message);
      navigate(`/appointments`);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid or expired OTP.");
    }
  };
  
  return (
    <div className="page-container">
      <div className="petshop-container">
        {/* Left Section - Pet Shop Info */}
        {clinic && (
          <div className="shop-info">
            <img
                src={`http://localhost:5000${clinic.logo}`}  // Fetch the logo dynamically
                className="shop-logo-book" 
              />
            <h2>{clinic.name}</h2>
            <p>{clinic.description}</p>
            {/* Add any other clinic information you want to display here */}
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
                Continue
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
          {/* Step 3: Pet & Owner Details */}
          {step === 3 && (
            <>
              <button className="back-button" onClick={() => setStep(2)}>
                ← Back
              </button>
              <h3>Pet & Owner Details</h3>
              <p>Please provide information about yourself and your pet.</p>

              <div className="scrollable-step">
                <label className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />

                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />

                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="form-label">Pet Name</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required 
                />

                <label className="form-label">Pet Type</label>
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
                
                <label className="form-label">Pet Gender</label>
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
              </div>

              <button className="action-button" onClick={handleSubmit}>SUBMIT</button>
            </>
          )}
          {step === 4 && otpSent && (
          <>
            <h3>Enter OTP</h3>
            <input
              type="text"
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP sent to your email"
            />
            <button className="action-button" onClick={handleVerifyOTP}>
              VERIFY OTP & CONFIRM APPOINTMENT
            </button>
          </>
        )}

        </div>
      </div>
    </div>
  );
}

export default PetShop;
