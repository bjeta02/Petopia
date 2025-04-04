import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { useAuth } from "./utils/auth";
import axios from "axios";
import "./css/VetAppointments.css";
import { AiOutlineConsoleSql } from "react-icons/ai";
import { QrReader } from "react-qr-reader";

const VetAppointments = () => {
  const { role, clinicId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const toast = React.useRef(null);
  const [qrDialog, setQrDialog] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [clinicId, role]);

  const fetchAppointments = async () => {
    if (role !== "admin" && !clinicId) {
      console.warn("❌ clinicId is null, skipping API call.");
      return; // Stop the function if there's no clinicId for non-admins
    }
  
    try {
      const url =
        role === "admin"
          ? `http://localhost:5000/api/appointments/` // Fetch all appointments
          : `http://localhost:5000/api/appointments/clinics/${clinicId}`; // Fetch only clinic-specific ones
  
      console.log("🔍 Fetching appointments from:", url);
      
      const response = await axios.get(url);
      const filteredAppointments = response.data.filter((appt) => {
        const status = appt.status ? appt.status.toLowerCase() : "";
        return (
          status === "pending" || 
          status === "confirmed" || 
          status === "in-progress" || 
          status === "ready-for-pickup"
        );
      });        
  
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch appointments.",
      });
    }
  };
  

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const updateData = { status };

      if (status === "Confirmed") {
        updateData.confirmedAt = new Date();
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
    setSelectedAppointment({
      ...appointment,
      originalStatus: appointment.status,
      status: "",
    });
    setEditDialog(true);
  };

  const handleUpdate = async (id, status, date, time, notes = 0, price = "") => {
    if (!id) {
        console.error("❌ No ID provided for update!");
        return;
    }

    try {
        console.log("🔵 Preparing appointment update...", { id, status, date, time, notes, price });

        // Prepare the request payload
        const updateData = { status };

        if (date) {
          const updatedDate = new Date(date);
          if (time) {
              const [hours, minutes] = time.split(":").map(Number);
              updatedDate.setHours(hours);
              updatedDate.setMinutes(minutes);
          }
          updateData.date = updatedDate; // Ensure this is a valid date
        }

        if (time) {
            updateData.time = time; // Keep time as a separate field if needed
        }

        if (notes) {
            updateData.notes = notes || "";
        }

        if (price) {
          updateData.price = price || ""; // Ensure price is included
      }

        // Send the update request to the backend
        const response = await axios.put(`http://localhost:5000/api/appointments/update/${id}`, updateData);

        console.log("🟢 Response from backend:", response.data);
        showToast("success", "Updated", "Appointment updated successfully.");
        
        fetchAppointments(); // Refresh the data
        setEditDialog(false); // Close dialog
    } catch (error) {
        console.error("🔴 Error updating appointment:", error);
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

        {rowData.status === "Pending" && (
          <>
            <Button icon="pi pi-check" className="accept-btn" onClick={() => updateAppointmentStatus(rowData._id, "Confirmed")} />
            <Button icon="pi pi-times" className="delete-btn" onClick={() => updateAppointmentStatus(rowData._id, "Cancelled")} />
          </>
        )}

        {rowData.status === "Confirmed" && (
          <>
            <Button icon="pi pi-check" className="accept-btn" onClick={() => updateAppointmentStatus(rowData._id, "In-progress")} />
            <Button icon="pi pi-times" className="delete-btn" disabled />
          </>
        )}
        {rowData.status === "In-progress" && (
          <>
            <Button icon="pi pi-check" className="accept-btn" onClick={() => updateAppointmentStatus(rowData._id, "Ready-for-pickup")} />
            <Button icon="pi pi-times" className="delete-btn" disabled />
          </>
        )}
        {rowData.status === "Ready-for-pickup" && (
          <>
            <Button icon="pi pi-check" className="accept-btn" onClick={() => updateAppointmentStatus(rowData._id, "Completed")} />
            <Button icon="pi pi-times" className="delete-btn" disabled />
          </>
        )}
      </div>
    );
  };

  const handleScan = (result) => {
    if (result) {
      console.log("QR Code Scanned:", result.text);
      setQrDialog(false);
      // Process scanned data here
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
  };
  
  return (
    <div className="vet-appointments-container">
      <Toast ref={toast} position="bottom-right" />
      <Button label="Scan QR Code" icon="pi pi-qrcode" onClick={() => setQrDialog(true)} className="p-button-success mb-4" />
      <h2 className="text-2xl font-bold mb-4">Pending Appointments</h2>
      <DataTable value={appointments} className="datatable" paginator rows={10}>
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
        style={{ width: "400px" }}
      >
        {selectedAppointment && (
          <div className="p-dialog-content">
            {/* Status Dropdown */}
            <div className="p-field">
              <label>Status</label>
              <select
                value={selectedAppointment?.status || ""}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    status: e.target.value,
                  })
                }
              >
                  <option value="" disabled>
                    Select Status
                  </option>
                {selectedAppointment?.originalStatus === "Pending" && (
                  <>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </>
                )}
                {selectedAppointment?.originalStatus === "Confirmed" && (
                  <>
                  <option value="In-progress">In-progress</option>
                  <option value="Ready-for-pickup">Ready-for-pickup</option>
                  </>
                )}
                {selectedAppointment?.originalStatus === "In-progress" && (
                  <>
                  <option value="Ready-for-pickup">Ready-for-pickup</option>
                  </>
                )}
                {(selectedAppointment?.originalStatus === "Ready-for-pickup") && (
                  <option value="Completed">Completed</option>
                )}
              </select>
            </div>

            {/* Date Picker */}
            <div className="p-field">
              <label>Date</label>
              <input
                type="date"
                value={
                  selectedAppointment?.date
                    ? new Date(selectedAppointment.date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  const existingTime = new Date(selectedAppointment.date);
                  newDate.setHours(existingTime.getHours(), existingTime.getMinutes());
                  setSelectedAppointment({
                    ...selectedAppointment,
                    date: newDate.toISOString(),
                  });
                }}
              />
            </div>

            {/* Time Picker */}
            <div className="p-field">
              <label>Time</label>
              <input
                type="time"
                value={
                  selectedAppointment?.date
                    ? new Date(selectedAppointment.date)
                        .toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                    : ""
                }
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newDate = new Date(selectedAppointment.date);
                  newDate.setHours(hours, minutes);
                  setSelectedAppointment({
                    ...selectedAppointment,
                    date: newDate.toISOString(),
                  });
                }}
              />
            </div>

            <div className="p-field">
              <label>Price</label>
              <div className="peso-input-container">
                <span className="peso-sign">₱</span>
                <input
                  value={selectedAppointment?.price || ""}
                  onChange={(e) =>
                    setSelectedAppointment({
                      ...selectedAppointment,
                      price: e.target.value,
                    })
                  }
                />
              </div>
            </div>


            {/* Notes Input */}
            <div className="p-field">
              <label>Notes</label>
              <input
                rows={2}
                value={selectedAppointment?.notes || ""}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}

        <div className="p-dialog-footer">
          <Button label="Cancel" className="p-button-cancel" onClick={() => setEditDialog(false)} />
          <Button
            label="Update"
            className={`p-button-confirm ${!selectedAppointment?.status ? "disabled-btn" : ""}`}
            onClick={() =>
              handleUpdate(
                selectedAppointment._id,
                selectedAppointment.status,
                selectedAppointment.date,
                selectedAppointment.time,
                selectedAppointment.notes,
                selectedAppointment.price
              )
            }
            disabled={!selectedAppointment?.status}
          />
        </div>  
      </Dialog>

      <Dialog visible={qrDialog} header="Scan QR Code" onHide={() => setQrDialog(false)}>
      <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: "100%" }} />
    </Dialog>
    </div>
  );
};

export default VetAppointments;
