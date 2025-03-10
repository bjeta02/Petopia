import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import "../components/css/vetClinic.css";

const ClinicProfile = () => {
  const [clinic, setClinic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    contact_number: "",
    description: "",
    days: "",
    open_time: "",
    close_time: "",
    services: [],
  });

  const clinicId = localStorage.getItem("clinicId");
  const role = localStorage.getItem("role");
  const toast = React.useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (role === "clinic" && clinicId) {
        const response = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setClinic(response.data);
        setFormData({
          address: response.data.address || "",
          contact_number: response.data.contact_number || "",
          description: response.data.description || "",
          days: response.data.days || "",
          open_time: response.data.open_time || "",
          close_time: response.data.close_time || "",
          services: response.data.services || [],
        });
      }
    };
    fetchData();
  }, [clinicId, role]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (index, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { service_name: value };
    setFormData({ ...formData, services: updatedServices });
  };

  const addService = () => {
    setFormData({ ...formData, services: [...formData.services, { service_name: "" }] });
  };

  const removeService = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updatedServices });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/clinics/update/${clinicId}`, formData);
      setClinic({ ...clinic, ...formData });
      setIsEditing(false);
      toast.current.show({ severity: "success", summary: "Success", detail: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating clinic:", error);
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to update profile" });
    }
  };

  if (!clinic) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <Toast ref={toast} position="bottom-right" />
      <div className="bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Clinic Name and Logo */}
        <Card className="p-4 text-center">
          <img src={`http://localhost:5000${clinic.logo}`} alt="Clinic Logo" className="cliniclogo" />
          <h1 className="text-xl font-bold">{clinic.name}</h1>
        </Card>

        {/* Location and Contact Info */}
        <Card className="p-4">
          <h3 className="text-lg font-bold">Location & Contact</h3>
          {isEditing ? (
            <>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-field" />
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleInputChange} className="input-field" />
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="input-field" />
              <input type="text" name="days" value={formData.days} onChange={handleInputChange} className="input-field" />
              <input type="time" name="open_time" value={formData.open_time} onChange={handleInputChange} className="input-field" />
              <input type="time" name="close_time" value={formData.close_time} onChange={handleInputChange} className="input-field" />
            </>
          ) : (
            <>
              <p><strong>Address:</strong> {clinic.address}</p>
              <p><strong>Contact:</strong> {clinic.contact_number}</p>
              <p><strong>Description:</strong> {clinic.description}</p>
              <p><strong>Schedule:</strong> {clinic.days}, {clinic.open_time} - {clinic.close_time}</p>
            </>
          )}
        </Card>

        {/* Services Offered */}
        <Card className="p-4 md:col-span-2">
            <h3 className="services-title">Services Offered</h3>
            {isEditing ? (
                <div className="edit-mode">
                    {formData.services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={service.service_name}
                                onChange={(e) => handleServiceChange(index, e.target.value)}
                                className="input-field"
                            />
                            <Button icon="pi pi-trash" className="delete-service-btn" onClick={() => removeService(index)} />
                        </div>
                    ))}
                    <Button label="Add Service" className="add-service-btn" onClick={addService} />
                </div>
            ) : (
                <ul className="services-list list-disc list-inside">
                    <p>{clinic.services?.map((service, index) => <li key={index}>{service.service_name}</li>)}</p>
                </ul>
            )}
        </Card>

        <div className="edit-container md:col-span-2">
            {isEditing ? (
                <Button label="Save Changes" className="save-button" onClick={handleSave} />
            ) : (
                <Button label="Edit Profile" className="edit-button" onClick={() => setIsEditing(true)} />
            )}
        </div>


      </div>
    </div>
  );
};

export default ClinicProfile;
