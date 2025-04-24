import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { Card } from "primereact/card";
import axios from "axios";

const ServiceManagement = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    estimated_duration: "",
    rate: ""
  });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clinics");
        setClinics(response.data.clinics);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    };
    fetchClinics();
  }, []);

  const handleClinicSelect = (clinic) => {
    console.log("Selected clinic:", clinic);
    setSelectedClinic(clinic);
    setServices(clinic.services || []); // Use the existing services array
};

  const handleInputChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleSaveService = async () => {
    try {
      if (selectedService) {
        // Update existing service
        await axios.put(`http://localhost:5000/api/services/update/${selectedService._id}`, serviceForm);
      } else {
        // Add new service
        await axios.post(`http://localhost:5000/api/services/add`, { ...serviceForm, clinic_id: selectedClinic._id });
      }
      toast.current.show({ severity: "success", summary: "Success", detail: "Service saved successfully" });
      setIsDialogVisible(false);
      setServiceForm({ name: "", description: "", estimated_duration: "", rate: "" });
      
      // Refresh services
      const updatedServices = await axios.get(`http://localhost:5000/api/services/clinic/${selectedClinic._id}`);
      setServices(updatedServices.data.services);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to save service" });
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceForm(service);
    setIsDialogVisible(true);
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/services/delete/${serviceId}`);
      toast.current.show({ severity: "success", summary: "Success", detail: "Service deleted successfully" });
      setServices(services.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete service" });
    }
  };

  return (
    <div className="service -management">
      <Toast ref={toast} position="bottom-right" />
      <Card className="p-4 card-services" style={{marginTop: '0px'}}>
            <div className="flex justify-between items-center mb-4">
            <h1 className="services-title font-bold" style={{ fontSize: '20px' }}>Clinics</h1>
            </div>

            <div className="overflow-auto">
            <table className="service-table w-full text-left border-collapse">
                <thead>
                <tr className="table-header">
                    <th className="p-2">Clinic Name</th>
                    <th className="p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {clinics.map((clinic, index) => (
                    <tr key={index} className="table-row">
                    <td className="p-2">
                        <img
                            src={`http://localhost:5000${clinic.logo}`}
                            alt={clinic.name}
                            className="logo-clinic"
                        />{clinic.name}</td>
                    <td className="p-2">
                    <Button
                        label="Manage Services"
                        onClick={() => handleClinicSelect(clinic)}
                        className="p-button-text"
                        style={{ marginLeft: '-60px' }} // Apply negative margin to the button
                    />
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </Card>
      

      {selectedClinic && (
        <div className="mt-4">
          <Card className="p-4 card-services">
          <div className="flex justify-between items-center mb-4">
            <div className="add-service-button">
            <h1 className="services-title font-bold" style={{fontSize: '20px'}}>Services for {selectedClinic.name}</h1>
              <Button
                label="Add"
                icon="pi pi-plus"
                className="p-button"
                onClick={() => setIsDialogVisible(true)}
              />
            </div>
          </div>

          <div className="overflow-auto">
            <table className="service-table w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="p-2">Service Name</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Estimated Duration (mins)</th>
                  <th className="p-2">Rate</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services?.map((service, index) => (
                  <tr key={index} className="table-row">
                    <td className="p-2">{service.name}</td>
                    <td className="p-2">{service.description}</td>
                    <td className="p-2">{service.estimated_duration}</td>
                    <td className="p-2">{service.rate}</td>
                    <td className="p-2 ">
                        <div className="action-buttons">
                      <Button
                        icon="pi pi-pencil"
                        className="p-button-text"
                        onClick={() => handleEditService(service)}
                      />
                      <Button
                        icon="pi pi-trash"
                        className="p-button-text p-button-danger"
                        onClick={() => handleDeleteService(service._id)}
                      />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      )}
    </div>
  );
};

export default ServiceManagement;