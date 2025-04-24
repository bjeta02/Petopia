import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { useAuth } from "./utils/auth";
import "./css/petProfile.css";

export default function PetProfile() {
    const auth = useAuth();
    const { ownerId } = auth || {};
    const [pets, setPets] = useState([]);
    const [pet, setPet] = useState({
        name: "",
        type: "",
        breed: "",
        gender: "",
        age: "",
        avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
    });
    const [petDialog, setPetDialog] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useRef(null);
    const [customType, setCustomType] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    const genderOptions = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" }
    ];

    const typeOptions = [
        { label: "Dog", value: "Dog" },
        { label: "Cat", value: "Cat" },
        { label: "Others", value: "Others" }
    ];

    useEffect(() => {
        if (ownerId) {
            fetchPets();
        } else {
            console.error("Owner ID is missing from auth context");
        }
    }, [ownerId]);

    const fetchPets = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:5000/api/pets/${ownerId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error("Failed to fetch pets");
            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Error fetching pets:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPet((prev) => ({ ...prev, [name]: value }));
    };

    const openNewPetDialog = () => {
        setPet({
            name: "",
            type: "",
            breed: "",
            gender: "",
            age: "",
            avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
        });
        setImagePreview(null); // Reset image preview when dialog is opened
        setPetDialog(true);
    };



    const handleAddPet = async () => {
        const token = localStorage.getItem("token");
        if (!token || !ownerId) return;
    
        const formData = new FormData();
        formData.append("name", pet.name);
        formData.append("type", pet.type === "Others" ? customType : pet.type);
        formData.append("breed", pet.breed);
        formData.append("age", pet.age);
        formData.append("gender", pet.gender);
        formData.append("owner_id", ownerId);
    
        if (fileInputRef.current?.files[0]) {
            formData.append("avatar", fileInputRef.current.files[0]);
        }
    
        try {
            const response = await fetch("http://localhost:5000/api/pets/register", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
    
            if (!response.ok) throw new Error("Failed to add pet");
    
            setPetDialog(false);
            await fetchPets();  // Reload full list from server
            toast.current.show({ severity: "success", summary: "Success", detail: "Pet added successfully!", life: 3000 });
        } catch (error) {
            console.error("Error adding pet:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to add pet.", life: 3000 });
        }
    };
    

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPet(prev => ({ ...prev, avatar: imageUrl }));  // Show preview instantly
            setImagePreview(imageUrl);  // Set for dialog preview too
        }
    };

    const handleUpdatePet = async () => {
        const token = localStorage.getItem("token");
        if (!token || !pet._id) return;
    
        const updatedPetData = { ...pet };
        if (pet.type === "Others") {
            updatedPetData.type = customType;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/pets/update/${pet._id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedPetData)
            });
    
            if (!response.ok) throw new Error("Failed to update pet");
    
            if (fileInputRef.current?.files[0]) {
                await handleImageChange(pet._id);  // Upload avatar if file was selected
            }
    
            setPetDialog(false);
            await fetchPets();  // Reload updated data
            toast.current.show({ severity: "success", summary: "Success", detail: "Pet updated successfully!", life: 3000 });
        } catch (error) {
            console.error("Error updating pet:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to update pet.", life: 3000 });
        }
    };

    const openEditPetDialog = (selectedPet) => {
        setPet(selectedPet);
        setImagePreview(null);  // Reset preview when opening for edit
        setPetDialog(true);
    };
        

    const handleDeletePet = async (petToDelete) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:5000/api/pets/delete/${petToDelete._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to delete pet");

            setPets((prev) => prev.filter((p) => p._id !== petToDelete._id));
            toast.current.show({ severity: "success", summary: "Success", detail: "Pet deleted successfully!", life: 3000 });
        } catch (error) {
            console.error("Error deleting pet:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete pet.", life: 3000 });
        }
    };

    const handleImageChange = async (petId) => {
        const token = localStorage.getItem("token");
        const file = fileInputRef.current?.files[0];
        if (!file || !petId || !token) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await fetch(`http://localhost:5000/api/pets/upload-pet-avatar/${petId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to upload avatar");

            const result = await response.json();
            setPet((prev) => ({ ...prev, avatar: result.avatarUrl }));
            toast.current.show({ severity: "success", summary: "Success", detail: "Avatar uploaded successfully!", life: 3000 });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.current.show({ severity: "error", summary: "Error", detail: "Failed to upload avatar.", life: 3000 });
        }
    };

    return (
        <div className="pet-profile-container">
            <Toast ref={toast} />
            <div className="add-pet-button" style={{ marginBottom: '20px' }}>
                <Button label="Add Pet" icon="pi pi-plus" className="custom-add-button" onClick={openNewPetDialog} />
            </div>
            <div className="pet-cards-container">
                {pets.map((pet) => (
                    <Card key={pet._id} className="pet-card">
                        <div className="profile-header">
                            <img
                                src={
                                    pet.avatar && pet.avatar.startsWith("http")
                                        ? pet.avatar
                                        : pet.avatar
                                        ? `http://localhost:5000${pet.avatar}`
                                        : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                }
                                alt="Profile"
                                className="pet-avatar"
                            />
                            <div className="pet-info">
                                <h4 className="font-semibold text-lg">{pet.name}</h4>
                                <p className="text-gray-500 text-sm">{pet.breed || "Unknown Breed"}</p>
                            </div>
                        </div>
                        <div className="pet-details">
                            <p className="text-gray-500">Type: <span className="font-medium">{pet.type}</span></p>
                            <p className="text-gray-500">Gender: <span className="font-medium">{pet.gender}</span></p>
                            <p className="text-gray-500">Age: <span className="font-medium">{pet.age}</span></p>
                        </div>
                        <div className="action-buttons">
                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-info" onClick={() => openEditPetDialog(pet)} />
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDeletePet(pet)} />
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog
                visible={petDialog}
                style={{ width: "40rem", borderRadius: "12px" }}
                header={<h2 className="dialog-title">🐾 {pet._id ? "Edit Pet Profile" : "Add Pet Details"}</h2>}
                modal
                onHide={() => setPetDialog(false)}
            >
                <div className="dialog-content">
                    <div className="field">
                        <label>Profile Photo</label>
                        <div className="pet-avatar-upload">
                            <div className="pet-profile-image-container">
                                <img
                                    src={imagePreview || (pet.avatar && pet.avatar.startsWith("http")
                                        ? pet.avatar
                                        : pet.avatar
                                        ? `http://localhost:5000${pet.avatar}`
                                        : "https://cdn-icons-png.flaticon.com/512/847/847969.png")}
                                    alt="Profile"
                                    className="dialog-pet-avatar"
                                />
                                <i className="pi pi-camera avatar-icon" onClick={() => fileInputRef.current.click()}></i>
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} className="pet-hidden-file-input" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="name">Name</label>
                        <InputText id="name" name="name" value={pet.name} onChange={handleInputChange} className="custom-input" placeholder="Enter Name" />
                    </div>

                    <div className="field">
                        <label htmlFor="type">Type</label>
                        <Dropdown
                            id="type"
                            name="type"
                            value={pet.type}
                            options={typeOptions}
                            onChange={(e) => {
                                const selectedType = e.value;
                                if (selectedType === "Others") {
                                    setPet(prev => ({ ...prev, type: selectedType }));
                                    setCustomType("");  // Reset the customType field
                                } else {
                                    setPet(prev => ({ ...prev, type: selectedType }));
                                    setCustomType("");  // Clear any old custom input
                                }
                            }}
                            placeholder="Select Type"
                            className="custom-dropdown"
                            panelClassName="custom-dropdown-panel"
                        />
                    </div>

                    {pet.type === "Others" && (
                        <div className="field">
                            <label htmlFor="customType">Specify Pet Type</label>
                            <InputText
                                id="customType"
                                name="customType"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="custom-input"
                                placeholder="Enter specific pet type"
                            />
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="breed">Breed</label>
                        <InputText id="breed" name="breed" value={pet.breed} onChange={handleInputChange} className="custom-input" placeholder="Enter Breed" />
                    </div>

                    <div className="field">
                        <label htmlFor="age">Age</label>
                        <InputText id="age" name="age" value={pet.age} onChange={handleInputChange} className="custom-input" placeholder="Enter Age" />
                    </div>

                    <div className="field">
                        <label htmlFor="gender">Gender</label>
                        <Dropdown
                            id="gender"
                            name="gender"
                            value={pet.gender}
                            options={genderOptions}
                            onChange={(e) => handleInputChange({ target: { name: "gender", value: e.value } })}
                            placeholder="Select Gender"
                            className="custom-dropdown"
                            panelClassName="custom-dropdown-panel"
                        />
                    </div>
                </div>

                <div className="dialog-footer">
                    <Button label="Cancel" icon="pi pi-times" className="cancel-btn" onClick={() => setPetDialog(false)} />
                    <Button label="Save" icon="pi pi-check" className="save-btn" onClick={pet._id ? handleUpdatePet : handleAddPet} />
                </div>
            </Dialog>
        </div>
    );
}
