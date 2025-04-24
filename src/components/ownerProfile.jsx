import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useAuth } from "./utils/auth";
import "./css/ownerProfile.css";

export default function OwnerProfile() {
    const auth = useAuth();
    const { ownerId } = auth;
    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef(null);
    const fileInputRef = useRef(null);
    const [owner, setOwner] = useState({
        firstname: "",
        lastname: "",
        phone: "",
        address: "",
        avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
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

    useEffect(() => {
        if (ownerId) {
            fetchOwnerData();
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

    const handleOwnerChange = (e) => {
        const { name, value } = e.target;
        setOwner({ ...owner, [name]: value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("avatar", file);
    
        try {
            const response = await fetch(`http://localhost:5000/api/owners/upload-avatar/${ownerId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
    
            if (!response.ok) throw new Error("Failed to upload avatar");
    
            const result = await response.json();
            setOwner((prev) => ({ ...prev, avatar: result.avatarUrl }));
    
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Avatar uploaded successfully!",
                life: 3000,
            });
        } catch (err) {
            console.error("Upload error:", err);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to upload avatar.",
                life: 3000,
            });
        }
    };
    

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-image-container">
                    <img
                        src={`http://localhost:5000${owner.avatar}`}
                        alt="Profile"
                        className="profile-avatar"
                        onClick={() => fileInputRef.current.click()}
                    />
                    <i className="pi pi-camera avatar-icon" onClick={() => fileInputRef.current.click()}></i>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden-file-input"
                    />
                </div>
                <div className="profile-info">
                    <h1>{owner.firstname} {owner.lastname}</h1>
                    <p>{owner.address}</p>
                </div>
            </div>
            <hr className="divider" />
            <div className="form-grid">
                <div className="form-row">
                    <div className="p-field">
                        <label htmlFor="firstname">First Name</label>
                        <InputText
                            id="firstname"
                            name="firstname"
                            value={owner.firstname}
                            onChange={handleOwnerChange}
                            disabled={!isEditing}
                            className={isEditing ? "editable" : "non-editable"}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="lastname">Last Name</label>
                        <InputText
                            id="lastname"
                            name="lastname"
                            value={owner.lastname}
                            onChange={handleOwnerChange}
                            disabled={!isEditing}
                            className={isEditing ? "editable" : "non-editable"}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="p-field">
                        <label htmlFor="phone">Phone</label>
                        <InputText
                            id="phone"
                            name="phone"
                            value={owner.phone}
                            onChange={handleOwnerChange}
                            disabled={!isEditing}
                            className={isEditing ? "editable" : "non-editable"}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="address">Address</label>
                        <InputText
                            id="address"
                            name="address"
                            value={owner.address}
                            onChange={handleOwnerChange}
                            disabled={!isEditing}
                            className={isEditing ? "editable" : "non-editable"}
                        />
                    </div>
                </div>
            </div>
            <div className="button-group">
                {isEditing ? (
                    <Button label="Save" icon="pi pi-check" onClick={handleSaveOwner} />
                ) : (
                    <Button label="Edit Profile" icon="pi pi-pencil" onClick={() => setIsEditing(true)} />
                )}
            </div>
            <Toast ref={toast} />
        </div>
    );
}