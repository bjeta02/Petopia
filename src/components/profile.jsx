import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Navigation } from "./navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { format } from 'date-fns';
import { Calendar } from "primereact/calendar"; 
import { Dropdown } from "primereact/dropdown";
import { useAuth } from "./utils/auth";
import "./css/profile.css";

export default function UserProfilePage() {
    const auth = useAuth();
    console.log("Auth Context:", auth); // Debugging
    const { ownerId } = auth; // Extracting ownerId
    const [isEditing, setIsEditing] = useState(false);
    const [pets, setPets] = useState([]);
    const [pet, setPet] = useState({ name: "", type: "", breed: "", gender: "", age: "" });
    const [petDialog, setPetDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const toast = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");

    
    const [owner, setOwner] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
        pet_count: 0,
        avatar: "https://via.placeholder.com/150",
    });

    const fetchOwnerData = async () => {
        const token = localStorage.getItem("token");
        if (token && ownerId) {
            try {
                const response = await fetch(`http://localhost:5000/api/owners/${ownerId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch owner data");

                const result = await response.json();
                if (result.success && result.data) {
                    setOwner(result.data);
                }
            } catch (error) {
                console.error("Error fetching owner data:", error);
            }
        }
    };

    const fetchPets = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await fetch(`http://localhost:5000/api/pets/${ownerId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch pets");

                const data = await response.json();
                setPets(data);
            } catch (error) {
                console.error("Error fetching pets:", error);
            }
        }
    };

    const fetchAppointments = async () => {
        const token = localStorage.getItem("token");
        if (token && ownerId) {
            try {
                const response = await fetch(`http://localhost:5000/api/appointments/${ownerId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                setAppointments(data);
            } catch (error) {
                console.error("Error fetching appointments:", error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
            }
        } else {
            console.error("Token or Owner ID is missing");
        }
    };

    useEffect(() => {
        if (ownerId) {
            fetchOwnerData();
            fetchPets();
            fetchAppointments();
        } else {
            console.error("Owner ID is missing in useAuth()");
        }
    }, [ownerId]);
    

    const handleSaveOwner = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await fetch(`http://localhost:5000/api/owners/update/${ownerId}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(owner),
                });

                if (!response.ok) throw new Error("Failed to update owner information");

                const updatedOwner = await response.json();
                setOwner(updatedOwner);
                setIsEditing(false);
                toast.current.show({ severity: "success", summary: "Success", detail: "Owner information updated!", life: 3000 });
            } catch (error) {
                console.error("Error updating owner information:", error);
                toast.current.show({ severity: "error", summary: "Error", detail: "Failed to update owner information.", life: 3000 });
            }
        }
    };

    const genderOptions = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
    ];

    const handleOwnerChange = (e) => {
        const { name, value } = e.target;
        setOwner({ ...owner, [name]: value || "" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPet({ ...pet, [name]: value });
    };

    const handleAddPet = async () => {
        const token = localStorage.getItem("token");
        if (token && ownerId) {
            try {
                const response = await fetch("http://localhost:5000/api/pets/register", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...pet, owner_id: ownerId }),
                });

                if (!response.ok) throw new Error("Failed to add pet");

                const newPet = await response.json();
                setPets((prevPets) => [...prevPets, newPet]);
                setPet({ name: "", type: "", gender: "" });
                setPetDialog(false);
                toast.current.show({ severity: "success", summary: "Success", detail: "Pet added successfully!", life: 3000 });
            } catch (error) {
                console.error("Error adding pet:", error);
                toast.current.show({ severity: "error", summary: "Error", detail: "Failed to add pet.", life: 3000 });
            }
        }
    };

    const openNewPetDialog = () => {
        setPet({ name: "", type: "", gender: "" });
        setPetDialog(true);
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex gap-2 justify-center">
            <Button icon="pi pi-pencil" rounded className="p-button-outlined p-button-info" onClick={() => handleEditPet(rowData)} />
            <Button icon="pi pi-trash" rounded className="p-button-outlined p-button-danger" onClick={() => handleDeletePet(rowData)} />
        </div>
    );

    const handleEditPet = (rowData) => {
        setPet(rowData);
        setPetDialog(true);
    };

    const handleDeletePet = async (rowData) => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await fetch(`http://localhost:5000/api/pets/delete/${rowData._id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Failed to delete pet");

                const updatedPets = pets.filter((pet) => pet._id !== rowData._id);
                setPets(updatedPets);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Pet deleted successfully!', life: 3000 });
            } catch (error) {
                console.error("Error deleting pet:", error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete pet.', life: 3000 });
            }
        }
    };

    const handleUpdatePet = async () => {
        const token = localStorage.getItem("token");
        if (token && pet._id) {
            try {
                const response = await fetch(`http://localhost:5000/api/pets/update/${pet._id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(pet),
                });

                if (!response.ok) throw new Error("Failed to update pet");

                const updatedPet = await response.json();
                const updatedPets = pets.map((p) => (p._id === updatedPet._id ? updatedPet : p));
                setPets(updatedPets);
                setPetDialog(false);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Pet updated successfully!', life: 3000 });
            } catch (error) {
                console.error("Error updating pet:", error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update pet.', life: 3000 });
            }
        }
    };

    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button 
                label="Add Pet" 
                icon="pi pi-plus" 
                className="custom-add-button"
                onClick={openNewPetDialog} 
            />
        </div>
    );

    const formatDateTime = (dateString) => {
        return format(new Date(dateString), 'MMMM dd, yyyy HH:mm');
    };

    const handleDateChange = (e) => {
        const date = e.value;
        setSelectedDate(date);
        const filtered = appointments.filter(appointment => 
            format(new Date(appointment.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        );
        setFilteredAppointments(filtered);
    };

    const AppointmentHistory = ({ appointments }) => {
        const [searchQuery, setSearchQuery] = useState(""); // State for search query
        
        const filteredAppointments = searchQuery
        ? appointments.filter((appt) => appt.pet_id?.name === searchQuery)
        : appointments;
    }

    const petOptions = pets.map((pet) => ({
        label: pet.name,
        value: pet.name,
      }));


      

    return (
        <div>
            <Navigation />
            <div className="profile-container">
                <div className="card-grid">
                    <div className="column">
                        <Card title={<span style={{ fontSize: "25px", fontWeight: "bold" }}>Owner Info</span>}>
                            <div className="profile-fields">
                                <div className="form-grid">
                                    <div className="p-field">
                                        <label htmlFor="firstname" className="label-margin">First Name</label>
                                        <InputText id="firstname" name="firstname" value={owner.firstname || ""} onChange={handleOwnerChange} disabled={!isEditing} />
                                    </div>
                                    <div className="p-field">
                                        <label htmlFor="lastname" className="label-margin">Last Name</label>
                                        <InputText id="lastname" name="lastname" value={owner.lastname || ""} onChange={handleOwnerChange} disabled={!isEditing} />
                                    </div>
                                    <div className="p-field">
                                        <label htmlFor="phone" className="label-margin">Phone</label>
                                        <InputText id="phone" name="phone" value={owner.phone} onChange={handleOwnerChange} disabled={!isEditing} />
                                    </div>
                                    <div className="p-field">
                                        <label htmlFor="address" className="label-margin">Address</label>
                                        <InputText id="address" name="address" value={owner.address} onChange={handleOwnerChange} disabled={!isEditing} />
                                    </div>
                                </div>
                                <div className="button-group">
                                    {isEditing ? (
                                        <Button 
                                            label="Save" 
                                            icon="pi pi-check" 
                                            className="custom-save-button" 
                                            onClick={handleSaveOwner} 
                                        />
                                    ) : (
                                        <Button 
                                            label="Edit Profile" 
                                            icon="pi pi-pencil" 
                                            className="custom-edit-button" 
                                            onClick={() => setIsEditing(true)} 
                                        />
                                    )}
                                </div>
                              </div>
                            </Card>
                        </div>

                        <div className="column">
                        <Card
                            title={<span style={{ fontSize: "25px", fontWeight: "bold" }}>Calendar</span>}
                            className="calendar-container"
                        >
                            <div className="calendar-content">
                                {/* Calendar Section */}
                                <div className="calendar">
                                <Calendar
                                    dateFormat="mm/dd/yy"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    inline
                                    monthNavigator
                                    yearNavigator
                                    dayTemplate={(date) => {
                                        const dailyAppointments = appointments.filter(
                                            (appointment) =>
                                                format(new Date(appointment.date), "yyyy-MM-dd") ===
                                                format(new Date(date), "yyyy-MM-dd")
                                        );

                                        return (
                                            <div className="calendar-day" onClick={() => setFilteredAppointments(dailyAppointments)}>
                                                <span>{date.getDate()}</span>
                                                {dailyAppointments.length > 0 && (
                                                    <span className="appointment-indicator">{dailyAppointments.length}</span>
                                                )}
                                            </div>
                                        );
                                    }}
                                />


                                </div>

                                {/* Appointment Details Section */}
                                <div className="appointment-details">
                                    <h3>Appointment Details</h3>
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map((appointment, index) => (
                                            <div key={index} className="appointment-detail">
                                                <p><strong>Notes:</strong> {appointment.notes}</p>
                                                <p><strong>Date:</strong> {formatDateTime(appointment.date)}</p>
                                                <p><strong>Status:</strong> {appointment.status}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No appointments selected.</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                    </div>
                </div>

                    <Card title={<span style={{ fontSize: "25px", fontWeight: "bold" }}>Pet Manager</span>} className="pet-manager">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} />
                        <DataTable 
                            value={pets} 
                            paginator 
                            rows={5} 
                            header={<h1>Pet List</h1>} 
                            globalFilter={globalFilter} 
                            className="p-datatable-striped p-datatable-gridlines"
                        >
                            <Column field="name" header="🐾 Pet Name" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
                            <Column field="type" header="🐶 Pet Type" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
                            <Column field="breed" header="Pet Breed" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
                            <Column field="gender" header="⚥ Gender" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
                            <Column field="age" header="Age" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
                            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem', textAlign: 'center', padding: '0.75rem' }} />
                        </DataTable>
                    </Card>

                    <Dialog 
                        visible={petDialog} 
                        style={{ width: "40rem", borderRadius: "12px" }} 
                        header={<h2 className="dialog-title">🐾 Add Pet Details</h2>} 
                        modal 
                        className="custom-dialog"
                        onHide={() => setPetDialog(false)}
                    >
                        <div className="dialog-content">
                            <div className="field">
                                <label htmlFor="name">Pet Name</label>
                                <InputText id="name" name="name" className="custom-input" value={pet.name} onChange={handleInputChange} />
                            </div>
                            <div className="field">
                                <label htmlFor="type">Pet Type</label>
                                <InputText id="type" name="type" className="custom-input" value={pet.type} onChange={handleInputChange} />
                            </div>
                            <div className="field">
                                <label htmlFor="breed">Pet Breed</label>
                                <InputText id="breed" name="breed" className="custom-input" value={pet.breed} onChange={handleInputChange} />
                            </div>
                            <div className="field">
                                <label htmlFor="gender">Pet Gender</label>
                                <Dropdown
                                    id="gender"
                                    name="gender"
                                    className="custom-dropdown"
                                    value={pet.gender}
                                    options={genderOptions}
                                    onChange={(e) => handleInputChange({ target: { name: "gender", value: e.value } })}
                                    placeholder="Select Gender"
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="age">Age</label>
                                <InputText id="age" name="age" className=" custom-input" value={pet.age} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="dialog-footer">
                            <Button label="Cancel" icon="pi pi-times" className="cancel-btn" onClick={() => setPetDialog(false)} />
                            <Button 
                                label="Save" 
                                icon="pi pi-check" 
                                className="save-btn" 
                                onClick={pet._id ? handleUpdatePet : handleAddPet} 
                            />
                        </div>
                    </Dialog>

                    <Card 
                        title={<span style={{ fontSize: "25px", fontWeight: "bold" }}>Appointment History</span>} 
                        className="appointment-history"
                        >
                        {/* Force-align search box to the right */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Dropdown
                            value={searchQuery}
                            options={petOptions}
                            onChange={(e) => setSearchQuery(e.value)}
                            placeholder="Select a Pet"
                            className="p-inputtext-sm"
                            style={{ width: "200px", height: "50px" }}
                            showClear
                            />
                        </div>
                        </div>

                        <DataTable
                            value={appointments}
                            paginator
                            rows={6}
                            className="p-datatable-striped p-datatable-gridlines"
                        >
                            <Column field="date" header="📅 Date" sortable body={(rowData) => formatDateTime(rowData.date)} />
                            <Column field="pet_id.name" header="🐾 Pet Name" sortable />
                            <Column field="notes" header="🩺 Reason" sortable />
                            <Column field="vetName" header="👨‍⚕️ Vet Name" sortable />
                            <Column field="status" header="Status" sortable />
                        </DataTable>
                     </Card>
                </div>
            </div>
    );
}