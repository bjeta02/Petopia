import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";

const ManageClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: "",
    address: "",
    contact_number: "",
    description: "",
    status: "Inactive",
    days: "",
    open_time: "",
    close_time: "",
    image: "",
    logo: "",
  });
  const toast = useRef(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  // Fetch clinics from the backend
  const fetchClinics = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/clinics");
            console.log("Fetched Clinics:", response.data); // Log the response data
            if (response.data.clinics && Array.isArray(response.data.clinics)) {
                setClinics(response.data.clinics); // Set the clinics state with the clinics array
            } else {
                console.error("Expected an array but got:", response.data);
            }
        } catch (error) {
            console.error("Error fetching clinics:", error);
        }
    };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleSaveClinic = async () => {
    try {
      if (selectedClinic) {
        await axios.put(`http://localhost:5000/api/clinics/${selectedClinic._id}`, newClinic);
        showToast("success", "Updated", "Clinic details updated successfully.");
      } else {
        await axios.post("http://localhost:5000/api/clinics", newClinic);
        showToast("success", "Added", "New clinic added successfully.");
      }
      setEditDialog(false);
      fetchClinics();
    } catch (error) {
      showToast("error", "Error", "Failed to save clinic.");
    }
  };

  const handleEdit = (clinic) => {
    setSelectedClinic(clinic);
    setNewClinic({ ...clinic });
    setEditDialog(true);
  };

  const handleNewClinic = () => {
    setSelectedClinic(null);
    setNewClinic({
      name: "",
      address: "",
      contact_number: "",
      description: "",
      status: "Inactive",
      days: "",
      open_time: "",
      close_time: "",
      image: "",
      logo: "",
    });
    setEditDialog(true);
  };

  const formatStatus = (rowData) => {
    return <span className={`status-tag ${rowData.status.toLowerCase()}`}>{rowData.status.toUpperCase()}</span>;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Toast ref={toast} />
      <h2 className="text-2xl font-bold mb-4">Manage Clinics</h2>
      <Button label="Add Clinic" icon="pi pi-plus" className="p-button-success mb-4" onClick={handleNewClinic} />

      <DataTable value={clinics} paginator rows={5} className="datatable">
        <Column field="name" header="Clinic Name" sortable />
        <Column field="address" header="Address" />
        <Column field="contact_number" header="Contact Number" />
        <Column field="status" header="Status" body={formatStatus} />
        <Column field="days" header="Days Open" />
        <Column field="open_time" header="Open Time" />
        <Column field="close_time" header="Close Time" />
        <Column
          header="Actions"
          body={(rowData) => (
            <Button icon="pi pi-pencil" className="p-button-warning" onClick={() => handleEdit(rowData)} />
          )}
        />
      </DataTable>

      {/* Add/Edit Dialog */}
      <Dialog visible={editDialog} header={selectedClinic ? "Edit Clinic" : "Add Clinic"} onHide={() => setEditDialog(false)}>
        <div className="p-fluid">
          <label>Clinic Name</label>
          <InputText value={newClinic.name} onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })} />

          <label>Address</label>
          <InputText value={newClinic.address} onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })} />

          <label>Contact Number</label>
          <InputText value={newClinic.contact_number} onChange={(e) => setNewClinic({ ...newClinic, contact_number: e.target.value })} />

          <label>Description</label>
          <InputText value={newClinic.description} onChange={(e) => setNewClinic({ ...newClinic, description: e.target.value })} />

          <label>Status</label>
          <Dropdown
            value={newClinic.status}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            onChange={(e) => setNewClinic({ ...newClinic, status: e.value })}
          />

          <label>Days Open</label>
          <InputText value={newClinic.days} onChange={(e) => setNewClinic({ ...newClinic, days: e.target.value })} />

          <label>Open Time</label>
          <Calendar
            value={newClinic.open_time ? new Date(`1970-01-01T${newClinic.open_time}`) : null}
            onChange={(e) => setNewClinic({ ...newClinic, open_time: e.value.toTimeString().split(" ")[0] })}
            timeOnly
          />

          <label>Close Time</label>
          <Calendar
            value={newClinic.close_time ? new Date(`1970-01-01T${newClinic.close_time}`) : null}
            onChange={(e) => setNewClinic({ ...newClinic, close_time: e.value.toTimeString().split(" ")[0] })}
            timeOnly
          />

          <label>Image URL</label>
          <InputText value={newClinic.image} onChange={(e) => setNewClinic({ ...newClinic, image: e.target.value })} />

          <label>Logo URL</label>
          <InputText value={newClinic.logo} onChange={(e) => setNewClinic({ ...newClinic, logo: e.target.value })} />
        </div>

        <div className="p-dialog-footer">
          <Button label="Cancel" className="p-button-secondary" onClick={() => setEditDialog(false)} />
          <Button label="Save" className="p-button-primary" onClick={handleSaveClinic} />
        </div>
      </Dialog>
    </div>
  );
};

export default ManageClinics;
