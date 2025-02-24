import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import "./Appointments.css";

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [editDialog, setEditDialog] = useState(false);
    const toast = React.useRef(null);

    useEffect(() => {
        fetchAppointments();
    }, []);
    
    // Fetch appointments from the backend
    const fetchAppointments = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/appointments");
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    // Show toast message
    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    // Handle delete appointment
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/appointments/delete/${id}`);
            showToast("success", "Deleted", "Appointment successfully deleted.");
            fetchAppointments(); // Refresh data
        } catch (error) {
            showToast("error", "Error", "Failed to delete appointment.");
        }
    };

    // Handle edit button click (open dialog)
    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setEditDialog(true);
    };

    const handleUpdate = async () => {
        try {
            const updatedData = { ...selectedAppointment };
    
            // Set timestamps based on status
            if (updatedData.status === "Completed") {
                updatedData.completedAt = new Date(); // Set current date and time
                updatedData.rejectedAt = null; // Clear rejected timestamp
            } else if (updatedData.status === "Cancelled") {
                updatedData.rejectedAt = new Date(); // Set current date and time
                updatedData.completedAt = null; // Clear completed timestamp
            }
    
            await axios.put(`http://localhost:5000/api/appointments/update/${selectedAppointment._id}`, updatedData);
            showToast("success", "Updated", "Appointment updated successfully.");
            setEditDialog(false);
            fetchAppointments();
        } catch (error) {
            showToast("error", "Error", "Failed to update appointment.");
        }
    };

    // Format the date for display
    const dateTemplate = (rowData) => {
        return new Date(rowData.date).toLocaleString(); // Format as needed
    };

    // Format status with styles
    const formatStatus = (rowData) => {
        return <span className={`status-tag ${rowData.status.toLowerCase()}`}>{rowData.status}</span>;
    };

    // Filter appointments based on status and duration
    const filteredAppointments = appointments.filter(appointment => {
        const now = new Date();
        const duration = 1 * 24 * 60 * 60 * 1000;
        const completedAtDate = new Date(appointment.completedAt);
        const rejectedAtDate = new Date(appointment.rejectedAt);
        
        // Check if the appointment is completed or cancelled
        if (appointment.status === "Completed") {
            return (now - completedAtDate) <= duration; // Keep if within duration
        } else if (appointment.status === "Cancelled") {
            return (now - rejectedAtDate) <= duration; // Keep if within duration
        }
        return true; // Keep other statuses
    });

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
        <div className="appointments-container">
            <Toast ref={toast} position="bottom-right" />

            <div className="toolbar">
                <Button label="Export" icon="pi pi-file" className="export-btn" />
            </div>

            <DataTable value={filteredAppointments} className="datatable" paginator rows={5}>
                <Column field="owner_id.name" header="Owner Name" />
                <Column field="pet_id.name" header="Pet Name" />
                <Column field="pet_id.type" header="Pet Type" />
                <Column field="service_id.name" header="Service Needed" />
                <Column field="date" header="Date" body={dateTemplate} />
                <Column field="status" header="Status" body={formatStatus} />
                <Column header="Actions" body={actionTemplate} />
            </DataTable>

            {/* Edit Dialog */}
            <Dialog visible={editDialog} header="Edit Appointment" onHide={() => setEditDialog(false)}>
                {selectedAppointment && (
                    <div className="p-field">
                        <label>Status</label>
                        <select
                            className="p-inputtext"
                            value={selectedAppointment.status}
                            onChange={(e) =>
                                setSelectedAppointment({ ...selectedAppointment, status: e.target.value })
                            }
                        >
                            < option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                )}
                <div className="p-dialog-footer">
                    <Button label="Cancel" className="p-button-secondary" onClick={() => setEditDialog(false)} />
                    <Button label="Update" className="p-button-primary" onClick={handleUpdate} />
                </div>
            </Dialog>
        </div>
    );
};

export default Appointments;