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
import { SearchIcon } from 'lucide-react';
import axios from "axios";

const ServiceManagement = () => {
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useRef(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clinics");
        setClinics(response.data.clinics);
        setFilteredClinics(response.data.clinics);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredClinics(clinics); // If searchTerm is empty, show all clinics
    } else {
      setFilteredClinics(
        clinics.filter(clinic =>
          clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, clinics]);

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

  const clinicLogoTemplate = (rowData) => {
    return (
      <img
        src={`http://localhost:5000${rowData.logo}`}
        alt={rowData.name}
        className="logo-clinic"
        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
      />
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <Button
          icon="pi pi-pencil"
          className="p-button-text"
          onClick={() => handleEditService(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger"
          onClick={() => handleDeleteService(rowData._id)}
        />
      </div>
    );
  };

  return (
    <div className="service-management">
      <Toast ref={toast} position="bottom-right" />
      <Card className="p-4 card-services" style={{ marginTop: "0px" }}>
        <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1 className="services-title font-bold" style={{ fontSize: "20px", marginBottom: "0px" }}>
            Service Management
          </h1>

          <div style={{ position: "relative", minWidth: '250px'}}>
              <SearchIcon size={20} style={{ 
              position: "absolute", 
              top: "50%", 
              left: "10px", 
              transform: "translateY(-50%)", 
              color: "#6c757d" 
              }} />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Clinics"
              className="p-inputtext p-component"
              style={{ width: '300px', paddingLeft: "3.5rem",  marginBottom: '0px' }}
            />
          </div>
        </div>

        <span className="datatable-line"></span>

        <div className="overflow-auto">
          <DataTable
            value={clinics}
            paginator
            rows={10}
            selectionMode="single"
            selection={selectedClinic}
            onSelectionChange={(e) => handleClinicSelect(e.value)}
            responsiveLayout="scroll"
            className="service-table"
          >
            <Column header="Logo" body={clinicLogoTemplate} />
            <Column header="Clinic Name" field="name" />
            <Column
              header="Actions"
              body={rowData => (
                <Button
                  label="Manage Services"
                  onClick={() => handleClinicSelect(rowData)}
                  className="p-button-text"
                  style={{background: "#14967f", color: "white", border: "none"}}
                />
              )}
            />
          </DataTable>
        </div>
      </Card>

      {selectedClinic && (
        <div className="mt-4">
          <Card className="p-4 card-services">
            <div className="" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
              <h1 className="services-title font-bold" style={{ fontSize: "20px", marginBottom: "0px" }}>
                Services for {selectedClinic.name}
              </h1>
              <Button
                label="Add"
                icon="pi pi-plus"
                className="p-button"
                onClick={() => setIsDialogVisible(true)}
                tooltip="Add"
                style={{width: "100px", background: "#14967f", border: "none", color: "white", height: "34px"}}
              />
            </div>

            <div className="overflow-auto">
              <DataTable value={services} paginator rows={10} responsiveLayout="scroll">
                <Column header="Service Name" field="name" />
                <Column header="Description" field="description" />
                <Column header="Estimated Duration (mins)" field="estimated_duration" />
                <Column header="Rate" field="rate" />
                <Column header="Actions" body={actionTemplate} />
              </DataTable>
            </div>
          </Card>
        </div>
      )}

      <Dialog
        header={selectedService ? "Edit Service" : "Add Service"}
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        style={{ width: "500px" }}
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

export default ServiceManagement;
