import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "./navigation";
import { useAuth } from "./utils/auth"
import axios from "axios";
import { Toast } from "primereact/toast"; // Import Toast
import "../components/css/petshop.css";

function PetShop() {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get("id");
  const { ownerId } = useAuth();
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
  const [medicalConcern, setMedicalConcern] = useState("");
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [clinic, setClinic] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPet, setSelectedPet] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading
  const [storeHours, setStoreHours] = useState({ open_time: "", close_time: "" });
  const toast = useRef(null); // Create a ref for Toast
  const selectedServiceObject = services.find(service => service._id === selectedService);

  useEffect(() => {
    console.log("selected Service: ", selectedService);
  });

  useEffect(() => {
    const fetchClinicData = async () => {
      if (!clinicId) {
        console.error("Clinic ID is undefined");
        return;
      }
      try {
        const clinicResponse = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setClinic(clinicResponse.data);
  
        // Extract open and close time from response
        const { open_time, close_time } = clinicResponse.data; 
  
        // Convert 24-hour time to 12-hour format with AM/PM
        const formatTime = (time) => {
          if (!time) return ""; // Avoid errors if time is missing
          const [hour, minute] = time.split(":");
          const hourInt = parseInt(hour, 10);
          const formattedHour = (hourInt % 12 || 12); // Convert 13 -> 1, 14 -> 2, etc.
          const period = hourInt >= 12 ? "PM" : "AM";
          return `${formattedHour}:${minute} ${period}`;
        };
  
        setStoreHours({
          open_time: formatTime(open_time), 
          close_time: formatTime(close_time), 
        });
  
        const servicesResponse = await axios.get(`http://localhost:5000/api/services/clinic/${clinicId}`);
        setServices(servicesResponse.data);
      } catch (error) {
        console.error("Error fetching clinic or services:", error);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch clinic data." }); // Show error toast
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

            if (ownerResponse.data?.success && ownerResponse.data?.data) {
              const owner = ownerResponse.data.data;
              setFirstName(owner.firstname || "");
              setLastName(owner.lastname || "");
              setEmail(owner.email || "");
            } else {
              console.error("Invalid ownerResponse format:", ownerResponse);
            }

            // Fetch pets if ownerId is present
            await fetchPets(token);
          }
        } catch (error) {
          console.error("Error fetching owner data:", error);
          toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch owner data." });
        }
      }
    };

    const fetchPets = async (token) => {
      if (!ownerId) {
        console.error("❌ Owner ID is missing, cannot fetch pets.");
        return;
      }
    
      try {
        const response = await axios.get(`http://localhost:5000/api/pets/${ownerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        console.log("✅ Pets fetched successfully:", response.data);
        setPets(response.data);
      } catch (error) {
        console.error("❌ Error fetching pets:", error.response ? error.response.data : error.message);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch pets." }); // Show error toast
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
      if (!medicalConcern) newErrors.medicalConcern = "Medical concern is required";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    setLoading(true); // Start loading
  
    try {
        const appointmentData = {
          owner_id: isGuest ? undefined : ownerId, // Ensure it's included for registered users
          firstName: isGuest ? firstname : undefined,
          lastName: isGuest ? lastname : undefined,
          email: isGuest ? email : undefined,
          petName,
          petType,
          petBreed,
          petGender,
          petAge,
          clinic_id: clinicId,
          date: selectedDate,
          service_id: selectedService,
          vet_id: "someVetId",
          notes: "Some notes",
          medical_concern: medicalConcern
      };    
  
      console.log("🚀 Sending appointment data:", appointmentData);
  
      const response = await axios.post("http://localhost:5000/api/appointments/book", appointmentData);
  
      let appointmentId;

      if (!isGuest && response.data.appointment) {
        appointmentId = response.data.appointment._id;
      }

      if (isGuest) {
        if (toast.current) {
          toast.current.show({ severity: "info", summary: "Info", detail: response.data.message });
        }
        setOtpSent(true);
        setStep(4);
      } else {
        if (toast.current) {
          toast.current.show({ severity: "success", summary: "Success", detail: "✅ Appointment booked successfully!" });
        }
        navigate(`/appointment-success`, {
          state: {
              appointment: {
                appointmentId: appointmentId,  // Use the direct value from the response
                clinicName: clinic?.name,  // Use the clinic name from the state
                date: selectedDate,
                service: selectedServiceObject,
                ownerName: `${firstname} ${lastname}`,
                ownerEmail: email,
                petName,
                petType,
                petBreed,
                petGender,
                petAge,
                medicalConcern
              }
          }
        });
      }
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      if (toast.current) {
        toast.current.show({ severity: "error", summary: "Error", detail: "An error occurred while booking the appointment." });
      }
    } finally {
      setLoading(false);
    }
};

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/appointments/verify-otp", {
        email,
        otp,
      });
      
      const appointmentId = response.data.appointment._id; // Use the ID from the response
  
      toast.current.show({ severity: "success", summary: "Success", detail: response.data.message });
  
      // ✅ Navigate to success page with correct info
      navigate(`/appointment-success`, {
        state: {
          appointment: {
            appointmentId: appointmentId,
            clinicName: clinicId?.name,
            date: selectedDate,
            service: selectedServiceObject, // You probably need to make sure this is correctly selected
            ownerName: `${firstname} ${lastname}`,
            ownerEmail: email,
            petName,
            petType,
            petBreed,
            petGender,
            petAge,
            medicalConcern
          }
        }
      });
  
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.current.show({ severity: "error", summary: "Error", detail: "Invalid or expired OTP." });
    } finally {
      setLoading(false);
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
    <div className={`page-container ${(step === 2 || step === 3) ? 'step-2-3-margin' : ''}`}>
      <Toast ref={toast} position="bottom-right" />
      <div className="petshop-container">

      {clinic && step !== 3 && (
        <div className={`shop-info-book ${step === 3 ? 'hide-on-step-3' : ''}`}>
          <img
            src={`http://localhost:5000${clinic.logo}`}
            className="shop-logo-book"
          />
          <h3>{clinic.name}</h3>
        </div>
      )}
      
        <div className={`form-container ${step === 3 ? 'step-3-active' : ''}`}>
          {step === 1 && (
            <>
              <div className="step-indicator">
                <span className={step === 1 ? "step active" : "step"}>1</span>
                <span className={step === 2 ? "step active" : "step"}>2</span>
                <span className={step === 3 ? "step active" : "step"}>3</span>
              </div>
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
              <div className="step-indicator">
                <span className={step === 1 ? "step active" : "step"}>1</span>
                <span className={step === 2 ? "step active" : "step"}>2</span>
                <span className={step === 3 ? "step active" : "step"}>3</span>
              </div>
              <h3>Appointment Details</h3>
              <p><strong>Store hours: {storeHours.open_time} - {storeHours.close_time}</strong></p>
              <label className="form-label">SCHEDULED ON</label>
              <input 
                type="date" 
                className={`date-picker ${errors.selectedDate ? "error-field" : ""}`} 
                value={selectedDate} 
                min={new Date().toISOString().split("T")[0]} // Disable past dates
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
              <div className="step-indicator">
                <span className={step === 1 ? "step active" : "step"}>1</span>
                <span className={step === 2 ? "step active" : "step"}>2</span>
                <span className={step === 3 ? "step active" : "step"}>3</span>
              </div>
              <h3>Pet & Owner Details</h3>
              <p>Please provide information about yourself and your pet.</p>

              <div className="scrollable-step">
                <label className="form-label">First Name</label>
                <input 
                  type="text" 
                  className={`input-field ${errors.firstname ? "error-field" : ""}`}
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your firstname"
                />
                {errors.firstname && <p className="error-text ">{errors.firstname}</p>}

                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className={`input-field ${errors.lastname ? "error-field" : ""}`}
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your lastname"
                />
                {errors.lastname && <p className="error-text">{errors.lastname}</p>}

                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className={`input-field ${errors.email ? "error-field" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <label className="form-label">Pet Name</label>
                {ownerId ? (
                  <select
                    className={`input-field ${errors.petName ? "error-field" : ""}`}
                    value={selectedPet} // Bind the value to petName state
                    onChange={(e) => {
                      const selectedPetId = e.target.value; // Get selected pet ID
                      setSelectedPet(selectedPetId); // Update state for selected pet
                      const selectedPet = pets.find(pet => pet._id === selectedPetId); // Find the pet object
                  
                      if (selectedPet) {
                        setPetName(selectedPet.name || ""); // Set petName to the selected pet's name
                        setPetBreed(selectedPet.breed || ""); // Set pet breed
                        setPetGender(selectedPet.gender || ""); // Set pet gender
                        setPetAge(selectedPet.age || ""); // Set pet age
                        setPetType(selectedPet.type || ""); // Set pet type
                      } else {
                        // Reset if no pet selected
                        setPetName(""); // Reset petName
                        setPetBreed("");
                        setPetGender("");
                        setPetAge("");
                        setPetType("");
                      }
                    }}
                  >
                    <option value="">Select a pet</option>
                    {pets && pets.length > 0 ? (
                      pets.map((pet) => (
                        <option key={pet._id} value={pet._id}> {/* Use pet._id as value */}
                          {pet.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading pets...</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    className={`input-field ${errors.petName ? "error-field" : ""}`}
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)} // Set pet name directly
                    placeholder="Enter pet name"
                  />
                )}
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
                  placeholder="Enter pet breed"
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

                <label className="form-label">Pet Age</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                  placeholder="Enter pet age"
                />

                <label className="form-label">Medical Concern</label>
                  <input 
                    type="text" 
                    className={`input-field ${errors.medicalConcern ? "error-field" : ""}`}
                    value={medicalConcern}
                    onChange={(e) => setMedicalConcern(e.target.value)} // Update state on change
                    placeholder="Enter any medical concerns"
                  />
                  {errors.medicalConcern && <p className="error-text">{errors.medicalConcern}</p>}
              </div>

              <button 
                className="action-button" 
                onClick={handleSubmit} 
                disabled={loading} // Disable when loading
              >
                {loading ? (
                  <span className="loading-text">
                    Booking <span className="pet-emoji">...</span>
                  </span>
                ) : "SUBMIT"}
              </button>
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