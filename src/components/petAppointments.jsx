import React, { useState, useRef, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { format } from "date-fns";
import { useAuth } from "./utils/auth";
import { InputText } from "primereact/inputtext"; 
import { FilterIcon, SearchIcon } from 'lucide-react';
import "./css/petAppointments.css";

export default function PetAppointments() {
    const auth = useAuth();
    const { ownerId } = auth;
    const [pets, setPets] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);
    const toast = useRef(null);

    const statusOptions = [
        { label: "Pending", value: "Pending" },
        { label: "Confirmed", value: "Confirmed" },
        { label: "In Progress", value: "In Progress" },
        { label: "Ready for Pickup", value: "Ready for Pickup" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" }
    ];
    

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
            result = result.filter(a => a.pet_id?.name?.toLowerCase().includes(selectedPet.toLowerCase()));
        }
        if (selectedClinic) {
            result = result.filter(a => a.clinic?.name?.toLowerCase().includes(selectedClinic.toLowerCase()));
        }
        if (selectedStatus) {
            result = result.filter(a => a.status?.toLowerCase() === selectedStatus.toLowerCase());
        }
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(a => 
                a.pet_id?.name?.toLowerCase().includes(lowerSearch) ||
                a.clinic?.name?.toLowerCase().includes(lowerSearch) ||
                a.vetName?.toLowerCase().includes(lowerSearch)
            );
        }
    
        setFilteredAppointments(result);
    }, [selectedPet, selectedClinic, selectedStatus, searchTerm, appointments]);
    

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

    const petBodyTemplate = (rowData) => {
        if (!rowData || !rowData.pet_id) {
            return <span>No Pet Data</span>; // Fallback if no pet data is available
        }
    
        const avatarPath = rowData.pet_id.avatar; // Access avatar from pet_id
        const avatarUrl = avatarPath ? `http://localhost:5000${avatarPath}` : "/images/placeholder.jpg";
    
        const petName = rowData.pet_id.name || "Unknown Pet";
        const petType = rowData.pet_id.type || "Unknown Type"; // Add this line
    
        return (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img 
                    src={avatarUrl}
                    alt="pet avatar"
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                />
                <span>{`${petName} (${petType})`}</span> {/* Name and Type together */}
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
        <div className="status-legend">
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
                    {statusLegend}
                </div>
    
                <span className="datatable-line"></span>
    
                <div className="filters-container">
                    {/* Search Bar */}
                    <div className="search-bar">
                        <SearchIcon size={20} className="search-icon" />
                        <InputText
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by Pet, Clinic, or Vet Name"
                            className="search-input"
                        />
                    </div>
    
                    {/* Filter Icon */}
                    <div className="filter-icon">
                        <FilterIcon size={24} />
                    </div>
    
                    {/* Filter Dropdowns */}
                    <div>
                        <Dropdown
                            value={selectedPet}
                            options={petOptions}
                            onChange={e => setSelectedPet(e.value)}
                            placeholder="Filter by Pet"
                            className="p-inputtext-sm filter-dropdown"
                            showClear
                        />
                    </div>
    
                    <div>
                        <Dropdown
                            value={selectedClinic}
                            options={clinicOptions}
                            onChange={e => setSelectedClinic(e.value)}
                            placeholder="Filter by Clinic"
                            className="p-inputtext-sm filter-dropdown"
                            showClear
                        />
                    </div>
    
                    <div>
                        <Dropdown
                            value={selectedStatus}
                            options={statusOptions}
                            onChange={e => setSelectedStatus(e.value)}
                            placeholder="Filter by Status"
                            className="p-inputtext-sm filter-dropdown"
                            showClear
                        />
                    </div>
                </div>
    
                <div className="datatable-wrapper">
                    <DataTable
                        value={filteredAppointments}
                        paginator
                        rows={20}
                        className="p-datatable-striped p-datatable-gridlines"
                    >
                        <Column field="pet_id" header="🐾 Pet Name" body={petBodyTemplate} />
                        <Column field="clinic.name" header="🏥 Clinic" body={clinicBodyTemplate} />
                        <Column field="service_id.name" header="Service Availed" />
                        <Column field="vetName" header="👨‍⚕️ Vet Name" />
                        <Column field="date" header="📅 Date" body={rowData => formatDateTime(rowData.date)} sortable />
                        <Column field="status" header="📌 Status" body={formatStatus} />
                    </DataTable>
                </div>
            </div>
        </div>
    );
    
}
