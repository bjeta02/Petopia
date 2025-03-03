import React, { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom'; // Import useParams
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/primereact.css";
import 'primeicons/primeicons.css'; // icons
import "./css/profile.css";
import { Dropdown } from "primereact/dropdown";

export default function UserProfilePage() {
  const { ownerId } = useParams(); // Get ownerId from URL parameters
  const [isEditing, setIsEditing] = useState(false);
  const [pets, setPets] = useState([]);
  const [pet, setPet] = useState({ name: "", type: "", gender: "" });
  const [petDialog, setPetDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);

  const [owner, setOwner] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    pet_count: 0,
    avatar: "https://via.placeholder.com/150",
  });

  // Fetch owner data using ownerId
  const fetchOwnerData = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`http://localhost:5000/api/owners/${ownerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setOwner(data);
      } catch (error) {
        console.error('Error fetching owner data:', error);
      }
    }
  };

  const fetchPets = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`http://localhost:5000/api/pets`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }

        const data = await response.json();
        const ownerPets = data.filter((p) => p.owner_id === ownerId);
        setPets(ownerPets);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    }
  };

  useEffect(() => {
    fetchOwnerData();
    fetchPets();
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
  
        if (!response.ok) {
          throw new Error("Failed to update owner information");
        }
  
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

  const [appointments, setAppointments] = useState([
    { date: "2024-02-20", petName: "Buddy", reason: "Vaccination", vetName: "Dr. Smith" },
    { date: "2024-02-18", petName: "Luna", reason: "Checkup", vetName: "Dr. Adams" }
  ]);

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwner({ ...owner, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPet({ ...pet, [name]: value });
  };

  useEffect(() => {
    fetchOwnerData();
    fetchPets();
  }, [ownerId]);
  
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
  
        if (!response.ok) {
          throw new Error("Failed to add pet");
        }
  
        const newPet = await response.json();
        setPets((prevPets) => [...prevPets, newPet]); // Update the pet list
        setPet({ name: "", type: "", breed: "", gender: "" });
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOwner({ ...owner, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
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

  const handleDeletePet = (rowData) => {
    const updatedPets = pets.filter((pet) => pet !== rowData);
    setPets(updatedPets);
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Pet deleted successfully!', life: 3000 });
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


  return (
    <div className="profile-container">
      <div className="card-grid">
        <div className="column">
          <Card title="Owner Info">
          <div className="profile-fields">

            <div className="form-grid">
              <div className="p-field">
                <label htmlFor="firstname" className="label-margin">First Name</label>
                <InputText id="firstname" name="firstname" value={owner.firstname} onChange={handleOwnerChange} disabled={!isEditing} />
              </div>
              <div className="p-field">
                <label htmlFor="lastname" className="label-margin">Last Name</label>
                <InputText id="lastname" name="lastname" value={owner.lastname} onChange={handleOwnerChange} disabled={!isEditing} />
              </div>
              <div className="p-field">
                <label htmlFor="email" className="label-margin">Email</label>
                <InputText id="email" name="email" value={owner.email} onChange={handleOwnerChange} disabled={!isEditing} />
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
        <Card title="Calendar" className="calendar">
          <div className="card flex justify-content-center">
            <Calendar 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.value)} 
              inline 
              showWeek={false}
              style={{ width: '100%', fontSize: '1.3rem', padding: '10px' }} 
            />
          </div>
        </Card>

        </div>
      </div>

      <Card title="Pet Manager" className="pet-manager">
        <Toast ref={toast} />
        <Toolbar className="mb-4" left={leftToolbarTemplate} />
        <DataTable 
          value={pets} 
          paginator 
          rows={5} 
          header=<h2>Pet List</h2> 
          globalFilter={globalFilter} 
          className="p-datatable-striped p-datatable-gridlines"
        >
          <Column field="name" header="🐾 Pet Name" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
          <Column field="type" header="🐶 Pet Type" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
          <Column field="breed" header="Pet Breed" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
          <Column field="gender" header="⚥ Gender" sortable style={{ minWidth: '12rem', padding: '0.75rem', margin: '0.5rem' }} />
          <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem', textAlign: 'center', padding: '0.75rem' }} />
        </DataTable>
      </Card>

      <Dialog 
          visible={petDialog} 
          style={{ width: "40rem", borderRadius: "12px", }} 
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
                    options={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" }
                    ]}
                    onChange={(e) => handleInputChange({ target: { name: "gender", value: e.value } })}
                    placeholder="Select Gender"
                />
              </div>
          </div>

          <div className="dialog-footer">
              <Button label="Cancel" icon="pi pi-times" className="cancel-btn" onClick={() => setPetDialog(false)} />
              <Button label="Save" icon="pi pi-check" className="save-btn" onClick={handleAddPet} />
          </div>
      </Dialog>

      <Card title="Appointment History" className="appointment-history">
        <DataTable value={appointments} paginator rows={5} className="p-datatable-striped p-datatable-gridlines">
          <Column field="date" header="📅 Date" sortable style={{ minWidth: '12rem', padding: '0.75rem' }} />
          <Column field="petName" header="🐾 Pet Name" sortable style={{ minWidth: '12rem', padding: '0.75rem' }} />
          <Column field="reason" header="🩺 Reason" sortable style={{ minWidth: '12rem', padding: '0.75rem' }} />
          <Column field="vetName" header="👨‍⚕️ Vet Name" sortable style={{ minWidth: '12rem', padding: '0.75rem' }} />
        </DataTable>
      </Card>


    </div>
  );
}