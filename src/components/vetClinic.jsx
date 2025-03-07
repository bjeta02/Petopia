import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import axios from "axios";

const ClinicProfile = () => {
  const [clinic, setClinic] = useState(null); // Initialize as null to handle loading state
  const clinicId = localStorage.getItem("clinicId"); // Get clinicId from localStorage

  useEffect(() => {
    const fetchClinicDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setClinic(response.data); // Set the clinic data from the response
      } catch (error) {
        console.error("Error fetching clinic details:", error);
      }
    };

    if (clinicId) {
      fetchClinicDetails(); // Fetch clinic details if clinicId exists
    }
  }, [clinicId]);

  // Show a loading state while fetching data
  if (!clinic) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Clinic Name and Logo */}
      <Card className="p-4 text-center">
        <img src={`http://localhost:5000${clinic.logo}`} alt="Clinic Logo" className="w-32 h-32 mx-auto mb-4" />
        <h2 className="text-xl font-bold">{clinic.name}</h2>
      </Card>
      
      {/* Location and Contact Info */}
      <Card className="p-4">
        <h3 className="text-lg font-bold">Location & Contact</h3>
        <p><strong>Address:</strong> {clinic.address}</p>
        <p><strong>Contact:</strong> {clinic.contact_number}</p>
        <p><strong>Description:</strong> {clinic.description}</p>
        <p><strong>Schedule:</strong> {clinic.days}, {clinic.open_time} - {clinic.close_time}</p>
      </Card>
  
      <Card className="p-4 md:col-span-2">
        <h3 className="text-lg font-bold">Services Offered</h3>
        <ul className="list-disc list-inside">
          {clinic.services?.map((service, index) => (
            <li key={index}>{service.service_name}</li>
          ))}
        </ul>
      </Card>
      
      <div className="md:col-span-2 text-center">
        <Button label="Edit Profile" className="p-button-primary mt-3" />
      </div>
    </div>
  );
};

export default ClinicProfile;