import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";

const AppointmentLogs = () => {
    const [appointments, setAppointments] = useState([]);
    const toast = React.useRef(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Fetch all appointments from the backend
    const fetchAppointments = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/appointments");
            // Filter appointments to only include completed and cancelled
            const filteredAppointments = response.data.filter(appointment => 
                appointment.status === "completed" || appointment.status === "cancelled"
            );
            setAppointments(filteredAppointments);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch appointments." });
        }
    };

    // Display the appropriate timestamp based on status
    const dateTemplate = (rowData) => {
        if (rowData.status === "completed" && rowData.completedAt) {
            return new Date(rowData.completedAt).toLocaleString();
        } else if (rowData.status === "cancelled" && rowData.rejectedAt) {
            return new Date(rowData.rejectedAt).toLocaleString();
        }
        return "N/A"; // Or return an empty string if preferred
    };

    return (
        <div className="appointment-logs-container">
            <Toast ref={toast} position="bottom-right" />

            <h2>Appointment Logs</h2>
            <DataTable value={appointments} className="datatable" paginator rows={10}>
                <Column field="owner_id.name" header="Owner Name" />
                <Column field="pet_id.name" header="Pet Name" />
                <Column field="clinic_id.name" header="Clinic Name" />
                <Column field="service_id.name" header="Service" />
                <Column field="status" header="Status" />
                <Column field="notes" header="Notes" />
                <Column header="Date" body={dateTemplate} />
            </DataTable>
        </div>
    );
};

export default AppointmentLogs;