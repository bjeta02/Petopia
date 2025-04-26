  import React, { useState, useRef, useEffect } from "react";
  import { Card } from "primereact/card";
  import { Button } from "primereact/button";
  import { DataTable } from "primereact/datatable";
  import { Column } from "primereact/column";
  import { Toast } from "primereact/toast";
  import { useAuth } from "./utils/auth";
  import axios from "axios";
  import "../components/css/vetClinic.css";
  import { InputTextarea } from 'primereact/inputtextarea';
  import { InputText } from 'primereact/inputtext';
  import { Dropdown } from 'primereact/dropdown';
  import { Calendar } from 'primereact/calendar';
  import { InputNumber } from 'primereact/inputnumber';
  import { Dialog } from 'primereact/dialog';
  import ToggleSwitch from './ToggleSwitch';
  import { styleText } from "util";

  const ClinicProfile = () => {
    const { role, clinicId } = useAuth();
    const [allClinics, setAllClinics] = useState([]);
    const [clinic, setClinic] = useState(null);
    const [isEditingLogo, setIsEditingLogo] = useState(false);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      address: "",
      contact_number: "",
      description: "",
      days: "",
      open_time: "",
      close_time: "",
      logo: null,
    });
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [serviceForm, setServiceForm] = useState({
      name: "",
      description: "",
      estimated_duration: "",
      rate: ""
    });
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const fileInputRef = useRef(null);
    const toast = useRef(null);

    useEffect(() => {
      const fetchData = async () => {
        if (role === "clinic" && clinicId) {
          const response = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
          setClinic(response.data);
          setFormData({
            name: response.data.name || "",
            email: response.data.email || "",
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
        const clinics = Array.isArray(res.data.clinics) ? res.data.clinics : [];
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

    const handleTimeChange = (name, value) => {
      setFormData({ ...formData, [name]: value });
    };

    const handleLogoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        setFormData(prev => ({ ...prev, logo: file }));
      }
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
          .filter(service => service.name?.trim() && !service._id)
          .map(service => {
            const { _id, ...rest } = service;
            return { ...rest, clinic_id: clinicId };
          });
    
        if (newServices.length > 0) {
          await axios.post("http://localhost:5000/api/services/add", newServices);
        }
    
        const existingServices = formData.services
          .filter(service => service._id)
          .map(service => {
            const { _id, ...rest } = service;
            return axios.put(`http://localhost:5000/api/services/update/${_id}`, rest);
          });
    
        await Promise.all(existingServices);
    
        setClinic({ ...clinic, ...formData });
        setIsEditingLogo(false);
        setIsEditingInfo(false);
    
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Profile updated successfully"
        });
    
      } catch (error) {
        console.error("Error saving clinic profile:", error);
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
        fetchAllClinics(); // Refresh the clinic list
      } catch (error) {
        console.error("Error updating status:", error);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to update status" });
      }
    };

    const statusBodyTemplate = (rowData) => (
      <span className={`status-tag ${rowData.status?.toLowerCase()}`}>{rowData.status}</span>
    );



    const actionBodyTemplate = (rowData) => (
      <div className="flex justify-center items-center admin-action-buttons"> {/* Center all items in a row */}
        <Button
          icon="pi pi-pencil"
          className="p-button-sm p-button-info"
          onClick={() => handleEditClinic(rowData)}
          tooltip="Edit"
          style={{ borderRadius: '50%', width: '33px'}}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-danger"
          onClick={() => handleDeleteClinic(rowData._id)}
          tooltip="Delete"
          style={{ borderRadius: '50%', width: '33px'}}
        />
        <ToggleSwitch
          isActive={rowData.status === "Active"}
          onToggle={() => handleStatusUpdate(rowData._id, rowData.status === "Active" ? "Inactive" : "Active")}
        />
      </div>
    );

    const handleEditClinic = (clinicData) => {
      setFormData({
        name: clinicData.name,
        email: clinicData.email,
        address: clinicData.address,
        contact_number: clinicData.contact_number,
        description: clinicData.description,
        days: clinicData.days,
        open_time: clinicData.open_time,
        close_time: clinicData.close_time,
        services: clinicData.services || [],
      });
      setIsDialogVisible(true); // Show the dialog for editing
    };

    const handleDeleteClinic = async (clinicId) => {
      try {
        await axios.delete(`http://localhost:5000/api/clinics/delete/${clinicId}`);
        toast.current.show({
          severity: "success",
          summary: "Deleted",
          detail: "Clinic deleted successfully"
        });
        fetchAllClinics(); // Refresh the clinic list
      } catch (error) {
        console.error("Error deleting clinic:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete clinic"
        });
      }
    };

    const convertTo12HourFormat = (time) => {
      const [hour, minute] = time.split(':');
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12; // Convert hour to 12-hour format
      return `${hour12}:${minute} ${suffix}`;
    };


    if (role === "admin") {
      return (
        <div className="superadmin">
          <Toast ref={toast} position="bottom-right" />
          <Card className="p-4 card-services" style={{marginTop: '0px'}}>
            <div className="clinic-profile-header">
              <h1 className="services-title font-bold" style={{ fontSize: '20px' }}>Clinic Management</h1>
              <Button label="Add" icon="pi pi-plus" className="clinic-add-button"/>
            </div>
          <DataTable value={allClinics} paginator rows={10} className="shadow-md rounded-lg">
            <Column 
              body={(rowData) => (
                <img 
                  src={`http://localhost:5000${rowData.logo}`} 
                  alt={`${rowData.name} Logo`} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} // Adjust size as needed
                />
              )} 
            />
            <Column field="name" header="Clinic Name" />
            <Column field="address" header="Address" />
            <Column field="contact_number" header="Contact" />
            <Column field="days" header="Schedule" />
            <Column 
              header="Operating time"
              body={(rowData) => {
                const openTime12Hour = convertTo12HourFormat(rowData.open_time);
                const closeTime12Hour = convertTo12HourFormat(rowData.close_time);

                return (
                <div>
                  <p>{openTime12Hour} - {closeTime12Hour  }</p>
                </div>
              )
              }}
            />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
          </Card>

          <Dialog
          header="Edit Clinic"
          visible={isDialogVisible}
          onHide={() => setIsDialogVisible(false)}
          style={{ width: '500px' }}
        >
          <div className="grid gap-3">
            <div className="p-field">
              <label>Name</label>
              <InputText name="name" value={formData.name} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="p-field">
              <label>Email</label>
              <InputText name="email" value={formData.email} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="p-field">
              <label>Address</label>
              <InputText name="address" value={formData.address} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="p-field">
              <label>Contact Number</label>
              <InputText name="contact_number" value={formData.contact_number} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="p-field">
              <label>Description</label>
              <InputTextarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full" />
            </div>
            <div className="p-field">
              <label>Days Open</label>
              <InputText name="days" value={formData.days} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="p-field">
              <label>Open Time</label>
              <input type="time" name="open_time" value={formData.open_time} onChange={handleInputChange} className="w-full" />
            </div>
            <div className="p-field">
              <label>Close Time</label>
              <input type="time" name="close_time" value={formData.close_time} onChange={handleInputChange} className="w-full" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button label="Save" onClick={handleSave} className="p-button-success" />
          </div>
        </Dialog>
        </div>
      );
    }

    if (!clinic) return <div>Loading...</div>;

    const formatTimeForDisplay = (time) => {
      if (!time) return 'N/A';
      const [hour, minute] = time.split(':');
      const h = parseInt(hour, 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const adjustedHour = h % 12 || 12;
      return `${adjustedHour}:${minute} ${period}`;
    };
    
    const formatTimeForSave = (date) => {
      if (!date) return '';
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };


    const handleEditService = (service) => {
      setSelectedService(service);
      setServiceForm({
        name: service.name,
        description: service.description,
        estimated_duration: service.estimated_duration,
        rate: service.rate
      });
      setIsDialogVisible(true);
    };

    const handleDeleteService = async (service) => {
      if (!service._id) return;
      try {
        await axios.delete(`http://localhost:5000/api/services/delete/${service._id}`);
        setFormData(prev => ({
          ...prev,
          services: prev.services.filter(s => s._id !== service._id)
        }));
        toast.current.show({
          severity: "success",
          summary: "Deleted",
          detail: "Service deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete service"
        });
      }
    };

    const addService = () => {
      setSelectedService(null); // Reset selected service
      setServiceForm({ name: "", description: "", estimated_duration: "", rate: "" }); // Reset form
      setIsDialogVisible(true); // Show the dialog
    };

    const handleSaveService = async () => {
      try {
        const serviceData = { ...serviceForm, clinic_id: clinicId }; // Include clinic_id
  
        if (selectedService) {
          // Update existing service
          await axios.put(`http://localhost:5000/api/services/update/${selectedService._id}`, serviceData);
        } else {
          // Add new service
          await axios.post(`http://localhost:5000/api/services/add`, [serviceData]); // Wrap in an array
        }
  
        // Refresh services
        const updatedClinic = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        setFormData(updatedClinic.data);
  
        toast.current.show({ severity: "success", summary: "Success", detail: "Service saved successfully" });
        setIsDialogVisible(false);
        setServiceForm({ name: "", description: "", estimated_duration: "", rate: "" });
      } catch (error) {
        console.error("Error saving service:", error);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to save service" });
      }
    };

    return (
      <div>
      <Toast ref={toast} position="bottom-right" />


      <Card className="p-4 card-logo">
        <div className="card-logo-wrapper">
          <div className="profile-image-container">
            <img
              src={`http://localhost:5000${clinic.logo}`}
              alt="Clinic Logo"
              className="cliniclogo"
            />
            <i
              className="pi pi-camera avatar-icon"
              onClick={() => fileInputRef.current.click()}
            ></i>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden-file-input"
              style={{ display: 'none' }}
            />
          </div>
          <div className="card-logo-info">
            <h1>{clinic.name}</h1>
            <p>{clinic.email}</p>
            <p>{clinic.contact_number}</p>
          </div>
        </div>
      </Card>


        {/* Clinic Information */}
        <Card className="p-4 card-info">
          <div className="bubutton mt-2">
            <h1>Personal Information</h1>
              {isEditingInfo ? (
                <Button label="Save" icon="pi pi-check" className="custom-save-btn" onClick={handleSave} />
              ) : (
                <Button label="Edit" icon="pi pi-pencil" className="custom-edit-btn" onClick={() => setIsEditingInfo(true)} />
              )}
          </div>

          <div className="grid">
            <div className="info-item">
              <strong>Name:</strong>
              {isEditingInfo ? (
                <InputText
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-margin"
                />
              ) : (
                <p>{clinic.name}</p>
              )}
            </div>

            <div className="info-item">
              <strong>Address:</strong>
              {isEditingInfo ? (
                <InputText
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-margin" // Apply the class here
                />
              ) : (
                <p>{clinic.address}</p>
              )}
            </div>
            <div className="info-item">
              <strong>Contact:</strong>
              {isEditingInfo ? (
                <InputText
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className="input-margin" // Apply the class here
                />
              ) : (
                <p>{clinic.contact_number}</p>
              )}
            </div>
            <div className="info-item">
              <strong>Description:</strong>
              {isEditingInfo ? (
                <InputTextarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-margin" // Apply the class here
                />
              ) : (
            <p>{clinic.description}</p>
              )}
            </div>
            <div className="info-item">
              <strong>Days Open:</strong>
              {isEditingInfo ? (
                <InputText
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  className="input-margin" // Apply the class here
                />
              ) : (
                <p>{clinic.days}</p>
              )}
            </div>
            <div className="info-item">
              <strong>Open Time:</strong>
              {isEditingInfo ? (
                <div className="p-field">
                  <input
                    type="time"
                    value={formData.open_time || ""}
                    onChange={(e) => {
                      handleTimeChange('open_time', e.target.value);
                    }}
                    style={{ width: '90%', border: '1px solid lightgrey' }} // Margin will be applied via CSS class
                    className="input-margin" // Apply the class here
                  />
                </div>
              ) : (
                <p>{formatTimeForDisplay(formData.open_time)}</p>
              )}
            </div>
            <div className="info-item">
              <strong>Close Time:</strong>
              {isEditingInfo ? (
                <div className="p-field">
                  <input
                    type="time"
                    value={formData.close_time || ""}
                    onChange={(e) => {
                      handleTimeChange('close_time', e.target.value);
                    }}
                    style={{ width: '90%', border: '1px solid lightgrey' }} // Margin will be applied via CSS class
                    className="input-margin" // Apply the class here
                  />
                </div>
              ) : (
                <p>{formatTimeForDisplay(formData.close_time)}</p>
              )}
            </div>
          </div>
        </Card>


        {/* Services Offered */}
        <Card className="p-4 card-services">
        <div className="add-service-button">
          <h1 className="services-title font-bold" style={{ fontSize: '20px' }}>Services Offered</h1>
          <Button label="Add" icon="pi pi-plus" className="p-button" onClick={addService} />
        </div>
        <DataTable value={formData.services} paginator rows={5}>
          <Column field="name" header="Service Name" />
          <Column field="description" header="Description" />
          <Column field="estimated_duration" header="Estimated Duration (mins)" />
          <Column field="rate" header="Rate" />
          <Column body={(rowData) => (
            <div className="action-buttons">
            <Button 
              icon="pi pi-pencil" 
              className="p-button-text" 
              onClick={() => {
                setSelectedService(rowData);
                setServiceForm(rowData);
                setIsDialogVisible(true);
              }} 
            >
              
            </Button>
            <Button 
              icon="pi pi-trash" 
              className="p-button-text p-button-danger" 
              onClick={() => handleDeleteService(rowData)} 
            >
              
            </Button>
          </div>
          )} header="Actions" />
        </DataTable>
      </Card>

        <Dialog
          header={selectedService ? "Edit Service" : "Add Service"}
          visible={isDialogVisible}
          onHide={() => setIsDialogVisible(false)}
          style={{ width: '500px' }}
        >
          <div className="grid gap-3">
            <div className="p-field">
              <label>Service Name</label>
              <InputText
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="p-field">
              <label>Description</label>
              <InputTextarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows={3}
                className="w-full"
              />
            </div>
            <div className="p-field">
              <label>Estimated Duration</label>
              <InputNumber
                value={serviceForm.estimated_duration}
                onValueChange={(e) => setServiceForm({ ...serviceForm, estimated_duration: e.value })}
                className="w-full"
              />
            </div>
            <div className="p-field">
              <label>Rate</label>
              <InputText
                value={serviceForm.rate}
                onChange={(e) => setServiceForm({ ...serviceForm, rate: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button label="Save" onClick={handleSaveService} className="p-button-success" />
          </div>
        </Dialog>
    </div>
    );
  };

  export default ClinicProfile; 