import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "./navigation";
import axios from "axios";
import "../components/css/petshop.css";

function PetShop() {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get("id");
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
  const [errors, setErrors] = useState({});

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
            // Ensure response structure is correct
            if (ownerResponse.data?.success && ownerResponse.data?.data) {
              const owner = ownerResponse.data.data;

              // Extract the correct name and email
              setFirstName(owner.firstname || owner.userId?.firstname || "");
              setLastName(owner.lastname || owner.userId?.lastname || "");
              setEmail(owner.email || owner.userId?.email || "");
            } else {
              console.error("Invalid ownerResponse format:", ownerResponse);
            }

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
    let newErrors = {};

    if (step === 3) {
      if (!firstname) newErrors.firstname = "First name is required";
      if (!lastname) newErrors.lastname = "Last name is required";
      if (!email) newErrors.email = "Email is required";
      if (!petName) newErrors.petName = "Pet name is required";
      if (!petType) newErrors.petType = "Pet type is required";
      if (!petBreed) newErrors.petBreed = "Pet breed is required";
      if (!petGender) newErrors.petGender = "Pet gender is required";
      if (!petAge) newErrors.petAge = "Pet age is required";

    }

    
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const appointmentData = {
        owner_id: ownerId,
        firstName: isGuest ? firstname : undefined,
        lastName: isGuest ? lastname : undefined,
        email: isGuest ? email : undefined,
        petName,
        petType,
        clinic_id: clinicId,
        date: selectedDate,
        service_id: selectedService,
        vet_id: "someVetId", // Replace with actual vet ID if needed
        notes: "Some notes",
      };

      console.log("Sending appointment data:", appointmentData);

      if (isGuest) {
        const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
        alert(response.data.message);
        setOtpSent(true);
        setStep(4);
      } else {
        const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
        alert("Appointment booked successfully!");
        navigate(`/appointment`);
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
      navigate(`/appointment`);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid or expired OTP.");
    }
  };

  const handleNextStep = () => {
    let newErrors = {};
    
    if (step === 2) {
      if (!selectedDate) newErrors.selectedDate = "Date is required";
      if (!selectedService) newErrors.selectedService = "Service is required";
    }

    if (step === 3) {
      if (!firstname) newErrors.firstname = "First name is required";
      if (!lastname) newErrors.lastname = "Last name is required";
      if (!email) newErrors.email = "Email is required";
      if (!petName) newErrors.petName = "Pet name is required";
      if (!petType) newErrors.petType = "Pet type is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setStep(step + 1);
  };
  
  return (
    <div className="page-container">
      <Navigation />
      <div className="petshop-container">
        {clinic && (
          <div className="shop-info-book">
            <img
              src={`http://localhost:5000${clinic.logo}`}  // Fetch the logo dynamically
              className="shop-logo-book" 
            />
            <h3>{clinic.name}</h3>
            <p>{clinic.description}</p>
          </div>
        )}

        <div className="form-container">
          <div className="step-indicator">
            <span className={step === 1 ? "step active" : "step"}>1</span>
            <span className={step === 2 ? "step active" : "step"}>2</span>
            <span className={step === 3 ? "step active" : "step"}>3</span>
          </div>

          {step === 1 && (
            <>
              <h3>Welcome!</h3>
              <p>To book a service, please provide your details.</p>
              <button className="action-button" onClick={() => setStep(2)}>
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button className="back-button" onClick={() => setStep(1)}>← Back</button>
              <h3>Appointment Details</h3>
              <p><strong>Store hours: 9:00 AM - 5:00 PM</strong></p>
              <label className="form-label">SCHEDULED ON</label>
              <input 
                type="date" 
                className={`date-picker ${errors.selectedDate ? "error-field" : ""}`} 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
              {errors.selectedDate && <p className="error-text">{errors.selectedDate}</p>}

              <label className="form-label">SELECT SERVICES</label>
              <select 
                className={`input-field ${errors.selectedService ? "error-field" : ""}`} 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>{service.name}</option>
                ))}
              </select>
              {errors.selectedService && <p className="error-text">{errors.selectedService}</p>}

              <button className="action-button" onClick={handleNextStep}>CONTINUE</button>
            </>
          )}

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
                  className={`input-field ${errors.firstname ? "error-field" : ""}`}
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstname && <p className="error-text ">{errors.firstname}</p>}

                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className={`input-field ${errors.lastname ? "error-field" : ""}`}
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastname && <p className="error-text">{errors.lastname}</p>}

                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className={`input-field ${errors.email ? "error-field" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <label className="form-label">Pet Name</label>
                <input 
                  type="text" 
                  className={`input-field ${errors.petName ? "error-field" : ""}`}
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />
                {errors.petName && <p className="error-text">{errors.petName}</p>}

                <label className="form-label">Pet Type</label>
                  <select
                    className={`input-field ${errors.petType ? "error-field" : ""}`}
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                  >
                    <option value="">Select Pet Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Others">Others</option>
                  </select>
                  {errors.petType && <p className="error-text">{errors.petType}</p>}


                <label className="form-label">Pet Breed</label>
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

                <label className="form-label">Pet Age</label>
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