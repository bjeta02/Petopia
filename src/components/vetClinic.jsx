import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const ClinicProfile = () => {
  const [clinic, setClinic] = useState({
    name: "Your Clinic Name",
    address: "Your Clinic Address",
    contact_number: "Your Contact Number",
    description: "Brief description of the clinic",
    logo: "https://via.placeholder.com/150",
    services: ["Vaccination", "Grooming", "Check-ups", "Surgery"],
    days: "Monday - Friday",
    open_time: "9:00 AM",
    close_time: "6:00 PM",
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Clinic Name and Logo */}
      <Card className="p-4 text-center">
        <img src={clinic.logo} alt="Clinic Logo" className="w-32 h-32 mx-auto mb-4" />
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
      
      {/* Services Offered */}
      <Card className="p-4 md:col-span-2">
        <h3 className="text-lg font-bold">Services Offered</h3>
        <ul className="list-disc list-inside">
          {clinic.services.map((service, index) => (
            <li key={index}>{service}</li>
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
