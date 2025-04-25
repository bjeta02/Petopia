import React, { useState, useRef, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { format } from "date-fns";
import { useAuth } from "./utils/auth";
import "./css/petAppointments.css";

export default function PetAppointments() {
    const auth = useAuth();
    const { ownerId } = auth;
    const [pets, setPets] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const toast = useRef(null);

    useEffect(() => {
        if (ownerId) {
            fetchPets();
            fetchAppointments();
        }
    }, [ownerId]);

    const fetchPets = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/pets/${ownerId}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Error fetching pets:", error);
        }
    };

    const fetchAppointments = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${ownerId}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json();
    
            // Sort by newest appointment first
            const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
            // Fetch clinic details for each appointment
            const appointmentsWithClinics = await Promise.all(sorted.map(async (appointment) => {
                try {
                    const clinicResponse = await fetch(`http://localhost:5000/api/clinics/${appointment.clinic_id?._id}`);
                    if (!clinicResponse.ok) {
                        const errorData = await clinicResponse.json();
                        console.error("Error fetching clinic:", errorData.message);
                        return {
                            ...appointment,
                            clinic: null, // Set clinic to null if fetching fails
                        };
                    }
                    const clinicData = await clinicResponse.json();
                    return {
                        ...appointment,
                        clinic: clinicData, // Add clinic data to the appointment
                    };
                } catch (error) {
                    console.error("Error fetching clinic:", error);
                    return {
                        ...appointment,
                        clinic: null, // Set clinic to null if fetching fails
                    };
                }
            }));

            setAppointments(appointmentsWithClinics);
            setFilteredAppointments(appointmentsWithClinics);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        }
    };

    // Dropdown options
    const petOptions = pets.map(pet => ({ label: pet.name, value: pet.name }));
    const clinicOptions = [...new Set(appointments.map(a => a.clinic?.name))]
        .filter(Boolean)
        .map(name => ({ label: name, value: name }));

    // Handle filters
    useEffect(() => {
        let result = [...appointments];

        if (selectedPet) {
            result = result.filter(a => a.pet_id?.name === selectedPet);
        }
        if (selectedClinic) {
            result = result.filter(a => a.clinic?.name === selectedClinic);
        }

        setFilteredAppointments(result);
    }, [selectedPet, selectedClinic, appointments]);

    const formatDateTime = date => format(new Date(date), "MMMM dd, yyyy HH:mm");

    const clinicBodyTemplate = (rowData) => {
        const logoPath = rowData.clinic?.logo;
        const logoUrl = logoPath ? `http://localhost:5000${logoPath}` : "/images/placeholder.jpg";

        return (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img 
                    src={logoUrl}
                    alt="clinic logo"
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                />
                <span>{rowData.clinic?.name || "Unknown Clinic"}</span>
            </div>
        );
    };    

    const formatStatus = (rowData) => {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                <span className={`status-circle ${rowData.status.toLowerCase()}`} style={{ marginRight: "8px" }} />
                <span>{rowData.status}</span>
            </div>
        );
    };

    // Status legend component with circles for each status
    const statusLegend = (
        <div className="status-legend" style={{ display: "flex", gap: "10px", flexWrap: "wrap"}}>
            <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="status-circle pending" />
                <span>Pending</span>
            </div>
            <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="status-circle confirmed" />
                <span>Confirmed</span>
            </div>
            <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="status-circle in-progress" />
                <span>In Progress</span>
            </div>
            <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="status-circle ready-for-pickup" />
                <span>Ready for Pickup</span>
            </div>
            <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="status-circle completed" />
                <span>Completed</span>
            </div>
            <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="status-circle cancelled" />
                <span>Cancelled</span>
            </div>
        </div>
    );

    return (
        <div>
                <div className="pet-appointment">
                    {/* Insert Status Legend Above Filters */}
                    <div className="patients-label">
                        <p>Status Legend</p>
                        {statusLegend}
                    </div>

                    <div className="filters-container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>

                        <div>
                            <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Filter by Pet:</span>
                            <Dropdown
                                value={selectedPet}
                                options={petOptions}
                                onChange={e => setSelectedPet(e.value)}
                                placeholder="Select Pet"
                                className="p-inputtext-sm"
                                showClear
                            />
                        </div>
                        <div>
                            <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Filter by Clinic:</span>
                            <Dropdown
                                value={selectedClinic}
                                options={clinicOptions}
                                onChange={e => setSelectedClinic(e.value)}
                                placeholder="Select Clinic"
                                className="p-inputtext-sm"
                                showClear
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                    <DataTable 
                        value={filteredAppointments}
                        paginator
                        rows={10}
                        className="p-datatable-striped p-datatable-gridlines"
                        style={{ minWidth: "300px" }}
                    >

                        <Column field="clinic.name" header="🏥 Clinic" body={clinicBodyTemplate} />
                        <Column field="pet_id.name" header="🐾 Pet Name" />
                        <Column field="notes" header="🩺 Reason" />
                        <Column field="vetName" header="👨‍⚕️ Vet Name" />
                        <Column field="date" header="📅 Date" body={rowData => formatDateTime(rowData.date)} sortable />
                        <Column field="status" header="📌 Status" body={formatStatus} />
                    </DataTable>
                    </div>
                </div>
        </div>
    );
}
