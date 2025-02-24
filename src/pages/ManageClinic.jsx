import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import "./ManageClinic.css";

const ManageClinics = () => {
    const [clinics, setClinics] = useState([]); // Initial state as an empty array
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [editDialog, setEditDialog] = useState(false);
    const [newClinic, setNewClinic] = useState({
        name: "",
        address: "",
        contact_number: "",
        email: "",
        description: "",
        status: "active",
        days: "",
        open_time: "",
        close_time: "",
        image: "",
        logo: ""
    });
    const toast = React.useRef(null);

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

    // Show toast message
    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    // Handle delete clinic
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/clinics/${id}`);
            showToast("success", "Deleted", "Clinic successfully deleted.");
            fetchClinics(); // Refresh data
        } catch (error) {
            showToast("error", "Error", "Failed to delete clinic.");
        }
    };

    // Handle edit button click (open dialog)
    const handleEdit = (clinic) => {
        setSelectedClinic(clinic);
        setNewClinic({ ...clinic });
        setEditDialog(true);
    };

    // Handle updating the clinic
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/clinics/update/${selectedClinic._id}`, newClinic);
            showToast("success", "Updated", "Clinic updated successfully.");
            setEditDialog(false);
            fetchClinics();
        } catch (error) {
            showToast("error", "Error", "Failed to update clinic.");
        }
    };

    // Handle adding a new clinic
    const handleAddClinic = async () => {
        try {
            await axios.post("http://localhost:5000/api/clinics", newClinic);
            showToast("success", "Added", "Clinic added successfully.");
            fetchClinics();
            setNewClinic({ name: "", address: "", contact_number: "", email: "", description: "", status: "inactive", days: "", open_time: "", close_time: "", image: "", logo: "" }); // Reset form
        } catch (error) {
            showToast("error", "Error", "Failed to add clinic.");
        }
    };

    // Format status with styles
    const formatStatus = (rowData) => {
        return <span className={`status-tag ${rowData.status.toLowerCase()}`}>{rowData.status}</span>;
    };

    // Display action buttons (Edit & Delete)
    const actionTemplate = (rowData) => {
        return (
            <div className="action-buttons">
                <Button icon="pi pi-pencil" className="edit-btn" onClick={() => handleEdit(rowData)} />
                <Button icon="pi pi-trash" className="delete-btn" onClick={() => handleDelete(rowData._id)} />
            </div>
        );
    };

    return (
        <div className="manage-clinics-container">
            <Toast ref={toast} position="bottom-right" />

            <div className="toolbar">
                <Button label="Add Clinic" icon="pi pi-plus" className="add-btn" onClick={() => setEditDialog(true)} />
            </div>

            <DataTable value={clinics} className="datatable" paginator rows={5}>
                <Column field="name" header="Clinic Name" />
                <Column field="address" header="Address" />
                <Column field="contact_number" header="Contact Number" />
                <Column field="email" header="Email" />
                <Column field="status" header="Status" body={formatStatus}/>
                <Column header="Actions" body={actionTemplate} />
            </DataTable>

            {/* Edit Dialog */}
            <Dialog visible={editDialog} header="Edit Clinic" onHide={() => setEditDialog(false)}>
                <div className="p-field">
                    <label>Status</label>
                    <select
                        value={newClinic.status}
                        onChange={(e) => setNewClinic({ ...newClinic, status: e.target.value })}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="p-dialog-footer">
                    <Button label=" Cancel" className="p-button-secondary" onClick={() => setEditDialog(false)} />
                    <Button label="Confirm" className="p-button-success" onClick={handleUpdate} />
                </div>
            </Dialog>
        </div>
    );
};

export default ManageClinics;