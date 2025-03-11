  import React, { useState, useEffect } from "react";
  import { Card } from "primereact/card";
  import { Button } from "primereact/button";
  import { DataTable } from "primereact/datatable";
  import { Column } from "primereact/column";
  import { Toast } from "primereact/toast";
  import axios from "axios";
  import "../components/css/vetClinic.css";

  const ClinicProfile = () => {
    const [allClinics, setAllClinics] = useState([]);
    const [clinic, setClinic] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      address: "",
      contact_number: "",
      description: "",
      days: "",
      open_time: "",
      close_time: "",
      services: [{ name: "", description: "", estimated_duration: "", rate: ""}],
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
    
        if (role === "admin") {
          await fetchAllClinics(); // ✅ use the new function here
        }
      };
    
      fetchData();
    }, [clinicId, role]);

    const fetchAllClinics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clinics");
        console.log("Fetched all clinics:", res);
        const clinics = Array.isArray(res.data.clinics) ? res.data.clinics : [];
        console.log("Fetched all clinics:", clinics);
        setAllClinics(clinics);
      } catch (err) {
        console.error("Failed to fetch clinics:", err);
      }
    };  

    const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (index, field, value) => {
      const updatedServices = [...formData.services];
      updatedServices[index][field] = value;
      setFormData({ ...formData, services: updatedServices });
    };

    const addService = () => {
      setFormData({
        ...formData,
        services: [
          ...formData.services,
          { name: "", description: "", estimated_duration: "", rate: "" },
        ],
      });
    };
    

    const removeService = (index) => {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      setFormData({ ...formData, services: updatedServices });
    };

    const handleSave = async () => {
      try {
        // 1. Save clinic profile updates
        await axios.put(`http://localhost:5000/api/clinics/update/${clinicId}`, formData);
    
        // 2. Prepare only valid, new services (with a name, no _id)
        const newServices = formData.services
          .filter(service => service.name?.trim() && !service._id) // only new services with name
          .map(service => {
            const { _id, ...rest } = service; // just in case
            return {
              ...rest,
              clinic_id: clinicId,
            };
          });
    
        // 3. Post new services to the backend if any
        if (newServices.length > 0) {
          await axios.post("http://localhost:5000/api/services/add", newServices);
        }
    
        // 4. Update existing services
        const existingServices = formData.services
          .filter(service => service._id) // only existing services with _id
          .map(service => {
            const { _id, ...rest } = service; // just in case
            return axios.put(`http://localhost:5000/api/services/update/${_id}`, rest);
          });
    
        // Wait for all updates to complete
        await Promise.all(existingServices);
    
        // 5. Update UI
        setClinic({ ...clinic, ...formData });
        setIsEditing(false);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Profile and services updated successfully"
        });
      } catch (error) {
        console.error("Error saving clinic profile or services:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to save changes"
        });
      }
    };
    

    

    const handleStatusUpdate = async (id, status) => {
      try {
        await axios.put(`http://localhost:5000/api/clinics/update/${id}`, { status });
        toast.current.show({ severity: "success", summary: "Updated", detail: "Status updated successfully" });
        fetchAllClinics();
      } catch (error) {
        console.error("Error updating status:", error);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to update status" });
      }
    };

    const statusBodyTemplate = (rowData) => (
      <span className={`status-tag ${rowData.status?.toLowerCase()}`}>{rowData.status}</span>
    );

    const actionBodyTemplate = (rowData) => (
      <div className="flex gap-2">
        {rowData.status === "Active" ? (
          <Button label="Deactivate" className="p-button-danger" onClick={() => handleStatusUpdate(rowData._id, "Inactive")} />
        ) : (
          <Button label="Activate" className="p-button-success" onClick={() => handleStatusUpdate(rowData._id, "Active")} />
        )}
      </div>
    );

    if (role === "admin") {
      return (
        <div className="p-6">
          <Toast ref={toast} position="bottom-right" />
          <h2 className="text-2xl font-bold mb-4">All Clinics</h2>
          <DataTable value={allClinics} paginator rows={5} className="shadow-md rounded-lg">
            <Column field="name" header="Clinic Name" />
            <Column field="address" header="Address" />
            <Column field="contact_number" header="Contact" />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
        </div>
      );
    }

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
                        <div key={index} className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input
                              type="text"
                              placeholder="Service Name"
                              value={service.name}
                              onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                              className="input-field"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={service.description}
                              onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                              className="input-field"
                            />
                            <input
                              type="number"
                              placeholder="Estimated Duration (minutes)"
                              value={service.estimated_duration}
                              onChange={(e) => handleServiceChange(index, "estimated_duration", e.target.value)}
                              className="input-field"
                            />
                            <input
                              type="text"
                              placeholder="Rate"
                              value={service.rate}
                              onChange={(e) => handleServiceChange(index, "rate", e.target.value)}
                              className="input-field"
                            />
                          </div>
                          <Button
                            icon="pi pi-trash"
                            className="p-button-danger"
                            onClick={() => removeService(index)}
                            label="Remove Service"
                          />
                        </div>
                      ))}
                      <Button label="Add Service" className="add-service-btn" onClick={addService} />
                  </div>
              ) : (
                <ul className="services-list list-disc list-inside">
                {clinic.services?.map((service, index) => (
                  <li key={index}>{service.name}</li>
                ))}
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