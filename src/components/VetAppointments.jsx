import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext"; 
import { FilterIcon, SearchIcon } from 'lucide-react';
import { Dropdown } from "primereact/dropdown";
import { useAuth } from "./utils/auth";
import axios from "axios";
import "./css/VetAppointments.css";
import { AiOutlineConsoleSql } from "react-icons/ai";
import { QrReader } from "react-qr-reader";

const VetAppointments = () => {
  const { role, clinicId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const toast = React.useRef(null);
  const [qrDialog, setQrDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedService, setSelectedService] = useState(null); // New state for selected service
  const [serviceOptions, setServiceOptions] = useState([]); // New state to store services

  const statusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "In Progress", value: "In Progress" },
    { label: "Ready for Pickup", value: "Ready for Pickup" },
  ];  


  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, [clinicId, role]);

  useEffect(() => {
    filterAppointments(); // Filter appointments whenever appointments or selectedStatus or selectedService changes
  }, [appointments, searchTerm, selectedStatus, selectedService]);


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

  const fetchServices = async () => {
    try {
      const url =
        role === "admin"
          ? `http://localhost:5000/api/services` // Fetch all services for admin
          : `http://localhost:5000/api/services/clinic/${clinicId}`; // Fetch services only for this clinic
  
      const response = await axios.get(url);
      const services = response.data;
  
      const formattedServices = services.map(service => ({
        label: service.name,   // 💬 Still using name for dropdown
        value: service.name    // 🔥 value is service.name not id!
      }));
  
      setServiceOptions(formattedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch services",
      });
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
  
    // Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((appt) => {
        const petName = appt.petDetails?.toLowerCase() || "";
        const ownerName = appt.ownerName?.toLowerCase() || "";
        const serviceName = appt.service_id?.name?.toLowerCase() || "";
        return (
          petName.includes(lowercasedSearchTerm) ||
          ownerName.includes(lowercasedSearchTerm) ||
          serviceName.includes(lowercasedSearchTerm)
        );
      });
    }
  
    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(
        (appt) => appt.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }
  
    // Filter by selected service (now by NAME)
    if (selectedService) {
      filtered = filtered.filter(
        (appt) => appt.service_id?.name === selectedService
      );
    }
  
    // Sort by date
    const today = new Date();
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const isTodayA = dateA.toDateString() === today.toDateString();
      const isTodayB = dateB.toDateString() === today.toDateString();
      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;
      return dateA - dateB;
    });
  
    setFilteredAppointments(filtered);
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

        // Append medical_concern to pet's medical_history
        const medicalConcern = selectedAppointment.medical_concern; // Get the medical concern from the selected appointment
        const petId = selectedAppointment.pet_id; // Get the pet ID from the selected appointment

        // Update the pet's medical history
        await axios.put(`http://localhost:5000/api/pets/update/${petId}`, {
          medical_history: medicalConcern // Append the medical concern
        });
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
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
            <span className={`status-circle ${rowData.status.toLowerCase()}`} style={{ marginRight: "8px" }} />
            <span>{rowData.status}</span>
        </div>
    );
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

  // Status legend component with circles for each status
  const statusLegend = (
    <div className="status-legend" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: '0px'}}>
        <div className="status-item" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
            <span className="status-circle pending" />
            <span>Pending</span>
        </div>
        <div className="status-item" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
            <span className="status-circle confirmed" />
            <span>Confirmed</span>
        </div>
        <div className="status-item" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
            <span className="status-circle in-progress" />
            <span>In Progress</span>
        </div>
        <div className="status-item" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
            <span className="status-circle ready-for-pickup" />
            <span>Ready for Pickup</span>
        </div>
        <div className="status-item" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
            <span className="status-circle completed" />
            <span>Completed</span>
        </div>
        <div className="status-item" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
            <span className="status-circle cancelled" />
            <span>Cancelled</span>
        </div>
    </div>
);
  
  return (
    <div className="vet-appointments-container">
      <Toast ref={toast} position="bottom-right" />

      <div className="patients-label">
          <h1 className="services-title font-bold" style={{ fontSize: "20px", marginBottom: "0px" }}>
              Appointment Management
          </h1>
          <div>
              {statusLegend}
          </div>
      </div>
      <span className="datatable-line"></span>

      <div className="flex-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

      <div className="filter-group">
        <div style={{ display: "flex", alignItems: "center" }}>
          <FilterIcon size={24} />
        </div>
        <div style={{ position: "relative", flexGrow: 1 }}>
          <Dropdown
            value={selectedStatus}
            options={statusOptions}
            onChange={(e) => setSelectedStatus(e.value)}
            placeholder="Filter by Status"
            className="p-inputtext-sm"
            showClear
            style={{
              height: "45px", 
              padding: "0 10px", 
              fontSize: "14px", 
              minWidth: "150px", 
              marginBottom: "10px"
            }}
          />
        </div>

        {/* Add gap between the two filters */}
        <div style={{ position: "relative", flexGrow: 1 }}>
          <Dropdown
            value={selectedService}
            options={serviceOptions}
            onChange={(e) => setSelectedService(e.value)}
            placeholder="Filter by Services"
            className="p-inputtext-sm"
            showClear
            style={{
              height: "45px", 
              padding: "0 10px", 
              fontSize: "14px",
              minWidth: "150px", 
              marginBottom: "10px"
            }}
          />
        </div>

        <div style={{ position: "relative", flexGrow: 1, minWidth: "250px" }}>
          {/* Search Icon inside input */}
          <SearchIcon size={20} style={{ 
              position: "absolute", 
              top: "40%", 
              left: "10px", 
              transform: "translateY(-50%)", 
              color: "#6c757d" 
          }} />

          {/* Input Text with padding to the left */}
            <InputText 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search"
                style={{ 
                    width: "100%", 
                    paddingLeft: "3.5rem", 
                    maxWidth: "400px"
                }}
            />
        </div>
      </div>

      <Button
        label="Scan QR Code"
        icon="pi pi-qrcode"
        onClick={() => setQrDialog(true)}
        className="custom-qr-btn"
      />
    </div>

      <DataTable value={filteredAppointments} className="datatable" paginator rows={20}>
        <Column field="ownerName" header="Owner Name" />
        <Column field="petDetails" header="Pet Details" />
        <Column field="service_id.name" header="Service Availed" />
        <Column field="medical_concern" header="Medical Concern" />
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

      <Dialog
        visible={qrDialog}
        header="Scan QR Code"
        onHide={() => setQrDialog(false)}
        style={{ width: "100%", maxWidth: "500px"}}
      >
        <div style={{ position: "relative",  width: "100%", maxWidth: '500px', height: "100%", maxHeight: '500px' }}>
          {/* QR Reader */}
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result, error) => {
              if (result) {
                const scannedText = result.getText?.();
                console.log("✅ QR Code Scanned:", scannedText);

                if (scannedText) {
                  if (scannedText.startsWith("http://") || scannedText.startsWith("https://")) {
                    setQrDialog(false);
                    window.location.href = scannedText;
                  } else {
                    console.warn("Scanned data is not a valid URL:", scannedText);
                  }
                }
              }
            }}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Overlays to darken everything except the scan box */}
          <div className="overlay-top" />
          <div className="overlay-bottom" />
          <div className="overlay-left" />
          <div className="overlay-right" />

          {/* The visible scan box in the center */}
          <div className="scan-box">
            <span className="corner top-left" />
            <span className="corner top-right" />
            <span className="corner bottom-left" />
            <span className="corner bottom-right" />
          </div>

          {/* Animated green line */}
          <div className="green-laser" />
        </div>
      </Dialog>

    </div>
  );
};

export default VetAppointments; 