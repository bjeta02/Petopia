  import React, { useState, useEffect } from "react";
  import { Card } from "primereact/card";
  import { Button } from "primereact/button";
  import { DataTable } from "primereact/datatable";
  import { Column } from "primereact/column";
  import { Toast } from "primereact/toast";
  import { useAuth } from "./utils/auth"
  import axios from "axios";
  import "../components/css/vetClinic.css";
  import { InputTextarea } from 'primereact/inputtextarea';
  import { InputText } from 'primereact/inputtext';
  import { InputNumber } from 'primereact/inputnumber';

  const ClinicProfile = () => {
    const { role, clinicId } = useAuth();
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
        <div className="superadmin">
          <Toast ref={toast} position="supadmin" />
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
      
      {/* Clinic Header */}
      <div className="text-center mb-6">
        <img src={`http://localhost:5000${clinic.logo}`} alt="Clinic Logo" className="cliniclogo mb-4" />
        <h1 className="text-xl font-bold">{clinic.name}</h1>
      </div>

      <div className="grid-container grid gap-6">

        {/* Clinic Information */}
        <Card className="p-4" style={{ maxWidth: '100%', width: '500px', margin: '0 auto' }}>
          <h1 className="text-lg font-bold mb-6">Location & Contact</h1>

          {isEditing ? (
            <>
              <div className="p-field">
                <label htmlFor="address">Address</label>
                <InputText
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="p-inputtext p-component w-full"
                />
              </div>
              <div className="p-field">
                <label htmlFor="contact_number">Contact Number</label>
                <InputText
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className="p-inputtext p-component w-full"
                />
              </div>
              <div className="p-field">
                <label htmlFor="description">Description</label>
                <InputTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full"
                />
              </div>
              <div className="p-field">
                <label htmlFor="days">Days</label>
                <InputText
                  id="days"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  className="p-inputtext p-component w-full"
                />
              </div>
              <div className="grid gap-4">
                <div className="p-field">
                  <label htmlFor="open_time">Opening Time</label>
                  <InputText
                    id="open_time"
                    type="time"
                    name="open_time"
                    value={formData.open_time}
                    onChange={handleInputChange}
                    className="p-inputtext p-component w-full"
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="close_time">Closing Time</label>
                  <InputText
                    id="close_time"
                    type="time"
                    name="close_time"
                    value={formData.close_time}
                    onChange={handleInputChange}
                    className="p-inputtext p-component w-full"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3><strong>Address:</strong> {clinic.address}</h3>
              <h3><strong>Contact:</strong> {clinic.contact_number}</h3>
              <h3><strong>Description:</strong> {clinic.description}</h3>
              <h3><strong>Schedule:</strong> {clinic.days}, {clinic.open_time} - {clinic.close_time}</h3>
            </>
          )}
        </Card>

        {/* Services Offered */}
        <Card className="p-4" style={{ maxWidth: '100%', width: '500px', margin: '0 auto' }}>
          <h1 className="services-title text-lg font-bold mb-4">Services Offered</h1>
          {isEditing ? (
            <>
              {formData.services.map((service, index) => (
                <div key={index} 
                className="border p-4 rounded-lg mb-6 bg-white shadow-sm"
                style={{ marginBottom: "1.5rem" }}
                >
                  <div className="grid gap-4">
                    <div className="p-field">
                      <label htmlFor={`service-name-${index}`}>Service Name</label>
                      <InputText
                        id={`service-name-${index}`}
                        placeholder="Service Name"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                        className="p-inputtext p-component w-full"
                      />
                    </div>
                    <div className="p-field">
                      <label htmlFor={`service-description-${index}`}>Description</label>
                      <InputTextarea
                        id={`service-description-${index}`}
                        placeholder="Service Description"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                        rows={3}
                        className="w-full"
                      />
                    </div>
                    <div className="p-field">
                      <label htmlFor={`service-duration-${index}`}>Estimated Duration</label>
                      <InputNumber
                        id={`service-duration-${index}`}
                        placeholder="Duration (minutes)"
                        value={service.estimated_duration}
                        onValueChange={(e) => handleServiceChange(index, "estimated_duration", e.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="p-field">
                      <label htmlFor={`service-rate-${index}`}>Rate</label>
                      <InputText
                        id={`service-rate-${index}`}
                        placeholder="Rate"
                        value={service.rate}
                        onChange={(e) => handleServiceChange(index, "rate", e.target.value)}
                        className="p-inputtext p-component w-full"
                      />
                    </div>
                  </div>
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger p-button-outlined"
                    onClick={() => removeService(index)}
                    label="Remove Service"
                  />
                  <h3>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</h3>
                </div>
                
              ))}
              <Button
                label="Add Service"
                icon="pi pi-plus"
                className="p-button-success"
                onClick={addService}
              />
            </>
          ) : (
            <ul className="services-list list-disc list-inside">
              {clinic.services?.map((service, index) => (
                <li key={index}>{service.name}</li>
              ))}
            </ul>
          )}
        </Card>

        {/* Edit or Save Button */}
        <div className="bubutton">
          {isEditing ? (
            <Button label="Save Changes" className="custom-save-btn" onClick={handleSave} />
          ) : (
            <Button label="Edit Profile" className="custom-edit-btn" onClick={() => setIsEditing(true)} />
          )}
        </div>

      </div>
    </div>
    );
  };

  export default ClinicProfile; 