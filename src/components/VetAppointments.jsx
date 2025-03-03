import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import "./css/VetAppointments.css";

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const toast = React.useRef(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/appointments");
        const filteredAppointments = response.data.filter(appt => {
            const status = appt.status ? appt.status.toLowerCase() : "";
            return status === "pending" || status === "confirmed";
        });
        setAppointments(filteredAppointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch appointments." });
    }
};


  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const updateData = { status };

      if (status === "Confirmed") {
        updateData.confirmedAt = new Date(); // Set confirmed timestamp
        updateData.completedAt = null;
        updateData.rejectedAt = null;
      } else if (status === "Completed") {
        updateData.completedAt = new Date();
        updateData.confirmedAt = null;
        updateData.rejectedAt = null;
      } else if (status === "Cancelled") {
        updateData.rejectedAt = new Date();
        updateData.confirmedAt = null;
        updateData.completedAt = null;
      }

      await axios.put(`http://localhost:5000/api/appointments/update/${id}`, updateData);
      showToast("success", "Updated", `Appointment marked as ${status}.`);
      fetchAppointments();
    } catch (error) {
      showToast("error", "Error", "Failed to update appointment status.");
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const updatedData = { ...selectedAppointment };

      if (updatedData.status === "Confirmed") {
        updatedData.confirmedAt = new Date();
        updatedData.completedAt = null;
        updatedData.rejectedAt = null;
      } else if (updatedData.status === "Completed") {
        updatedData.completedAt = new Date();
        updatedData.confirmedAt = null;
        updatedData.rejectedAt = null;
      } else if (updatedData.status === "Cancelled") {
        updatedData.rejectedAt = new Date();
        updatedData.confirmedAt = null;
        updatedData.completedAt = null;
      }

      await axios.put(`http://localhost:5000/api/appointments/update/${selectedAppointment._id}`, updatedData);
      showToast("success", "Updated", "Appointment updated successfully.");
      setEditDialog(false);
      fetchAppointments();
    } catch (error) {
      showToast("error", "Error", "Failed to update appointment.");
    }
  };

  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleString();
  };

  const formatStatus = (rowData) => {
    return <span className={`status-tag ${rowData.status.toLowerCase()}`}>{rowData.status.toUpperCase()}</span>;
};

  const actionTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <Button icon="pi pi-pencil" className="edit-btn" onClick={() => handleEdit(rowData)} />
        <Button icon="pi pi-check" className="accept-btn" onClick={() => updateAppointmentStatus(rowData._id, "Confirmed")} />
        <Button icon="pi pi-times" className="delete-btn" onClick={() => updateAppointmentStatus(rowData._id, "Cancelled")} />
      </div>
    );
  };

  return (
    <div className="vet-appointments-container">
      <Toast ref={toast} position="bottom-right" />
      <h2 className="text-2xl font-bold mb-4">Pending Appointments</h2>
      <DataTable value={appointments} className="datatable" paginator rows={5}>
          <Column field="ownerName" header="Owner Name" />
          <Column field="petDetails" header="Pet Details" />
          <Column field="service_id.name" header="Service Availed" />
        <Column field="date" header="Appointment Date" body={dateTemplate} />
        <Column field="status" header="Status" body={formatStatus} />
        <Column header="Actions" body={actionTemplate} />
      </DataTable>

      <Dialog 
          visible={editDialog} 
          header="Edit Appointment" 
          onHide={() => setEditDialog(false)} 
          className="p-fluid edit-appointment-dialog"
          style={{ width: '400px' }} // ⬅️ Adjust width
      >
          {selectedAppointment && (
              <div className="p-dialog-content">
                  <div className="p-field">
                      <label>Status</label>
                      <select
                          value={selectedAppointment.status}
                          onChange={(e) => setSelectedAppointment({ ...selectedAppointment, status: e.target.value })}
                      >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                      </select>
                  </div>
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

export default VetAppointments;
