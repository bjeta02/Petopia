import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"
import { FilterIcon, SearchIcon } from "lucide-react";
import { Card } from "primereact/card"
import "../components/css/VetHistory.css";
import { useAuth } from "./utils/auth";

const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
]; 

const VetUsers = () => {
    const { role } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const toast = useRef(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [selectedUser , setSelectedUser ] = useState(null);
    const [newUserData, setNewUserData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: "clinic", // Default role
    });
    const [isAddUserDialogVisible, setIsAddUserDialogVisible] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, selectedStatus, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to fetch users",
            });
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                `${user.firstname} ${user.lastname}`.toLowerCase().includes(lowercasedSearchTerm) ||
                user.email.toLowerCase().includes(lowercasedSearchTerm)
            );
        }

        if (selectedStatus) {
            filtered = filtered.filter(user => user.status.toLowerCase() === selectedStatus.toLowerCase());
        }

        setFilteredUsers(filtered);
    };

    const handleUpdateUser = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/users/update/${selectedUser._id}`, newUserData);
            
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "User updated successfully!",
            });
    
            fetchUsers(); // Refresh the user list
            setIsDialogVisible(false); // Close the dialog
        } catch (error) {
            console.error("Error updating user:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "Failed to update user",
            });
        }
    };
    

    const handleEditUser  = (user) => {
        setSelectedUser (user);
        setNewUserData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
        });
        setIsDialogVisible(true);
    };

    const handleNewUserInputChange = (e) => {
        const { name, value } = e.target;
        setNewUserData({ ...newUserData, [name]: value });
    };

    const openAddUserDialog = () => {
        setNewUserData({
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            role: "clinic", // Default role
        });
        setIsAddUserDialogVisible(true); // Show the dialog
    };

    const handleAddUser  = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/users/register`, newUserData);
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: response.data.message,
            });
            fetchUsers(); // Refresh the user list
            setIsAddUserDialogVisible(false); // Close the dialog
        } catch (error) {
            console.error("Error adding user:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "Failed to add user",
            });
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            // Send a POST request with the userId in the request body
            await axios.delete('http://localhost:5000/api/users/delete', {
                data: { userId },  // Pass the userId in the request body
            });
    
            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: "User deleted successfully",
            });
    
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete user",
            });
        }
    };

    const statusBodyTemplate = (rowData) => {
        const isActive = rowData.status === "Active";
        const statusColor = isActive ? "#28a745" : "#dc3545"; // green or red
        const statusText = isActive ? "Active" : "Inactive";
    
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                    style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: statusColor, 
                        display: 'inline-block' 
                    }} 
                />
                <span>{statusText}</span>
            </div>
        );
    };
    
    const actionTemplate = (rowData) => {
        return (
            <div className="action-buttons">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-text"
                    onClick={() => handleEditUser (rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger"
                    onClick={() => handleDeleteUser (rowData._id)}
                />
            </div>
        );
    };

    return (
        <div className="vet-users-container">
            <Toast ref={toast} />
            <Card className="p-4 card-services" style={{ marginTop: '0px' }}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: 'center'}}>
                    <h1 className="services-title font-bold" style={{ fontSize: "20px", marginBottom: "0px" }}>
                        User Management
                    </h1>
                    <Button
                        label="Add User"
                        icon="pi pi-plus"
                        onClick={openAddUserDialog}
                        style={{ height: '43px', width: '100px', backgroundColor: '#14967f', border: 'none', color: 'white', fontSize: '12px'}}
                    />
                </div>
            <span className="datatable-line"></span>

            <div className="flex-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ position: "relative", minWidth: "250px", marginBottom: '0px' }}>
                    <SearchIcon size={20} style={{ position: "absolute", top: "40%", left: "10px", transform: "translateY(-50%)", color: "#6c757d" }} />
                    <InputText 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        style={{ width: "100%", paddingLeft: "3.5rem", maxWidth: "400px", marginBottom: '0px' }}
                    />
                </div>
                <Dropdown
                    value={selectedStatus}
                    options={statusOptions}
                    onChange={(e) => setSelectedStatus(e.value)}
                    placeholder="Filter by Status"
                    className="p-inputtext-sm"
                    showClear
                    style={{ height: "45px", padding: "0 10px", fontSize: "14px", minWidth: "150px" }}
                />
            </div>

            <div className="table-wrapper">
                <DataTable value={filteredUsers} paginator rows={10} className="custom-table">
                    <Column header="Name" body={(rowData) => `${rowData.firstname} ${rowData.lastname}`} />
                    <Column field="email" header="Email" />
                    <Column field="role" header="Role" />
                    <Column header="Status" body={statusBodyTemplate} />
                    <Column header="Actions" body={actionTemplate} />
                </DataTable>
            </div>

            <Dialog
                header="Add New User"
                visible={isAddUserDialogVisible}
                onHide={() => setIsAddUserDialogVisible(false)}
                style={{ width: '400px' }}
            >
                <div className="grid gap-3">
                    <div className="p-field">
                        <label>First Name</label>
                        <InputText name="firstname" value={newUserData.firstname} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Last Name</label>
                        <InputText name="lastname" value={newUserData.lastname} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Email</label>
                        <InputText name="email" value={newUserData.email} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Password</label>
                        <InputText type="password" name="password" value={newUserData.password} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Role</label>
                        <Dropdown 
                            name="role" 
                            value={newUserData.role} 
                            options={[
                                { label: "Clinic", value: "clinic" },
                                { label: "Admin", value: "admin" },
                                { label: "Owner", value: "owner" }
                            ]} 
                            onChange={handleNewUserInputChange} 
                            className="w-full" 
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button label="Add User" onClick={handleAddUser} className="p-button-success" />
                </div>
            </Dialog>

            <Dialog
                header="Edit User"
                visible={isDialogVisible}
                onHide={() => setIsDialogVisible(false)}
                style={{ width: '400px' }}
            >
                <div className="grid gap-3">
                    <div className="p-field">
                        <label>First Name</label>
                        <InputText name="firstname" value={newUserData.firstname} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Last Name</label>
                        <InputText name="lastname" value={newUserData.lastname} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Email</label>
                        <InputText name="email" value={newUserData.email} onChange={handleNewUserInputChange} className="w-full" />
                    </div>
                    <div className="p-field">
                        <label>Role</label>
                        <Dropdown 
                            name="role" 
                            value={newUserData.role} 
                            options={[
                                { label: "Clinic", value: "clinic" },
                                { label: "Admin", value: "admin" },
                                { label: "Owner", value: "owner" }
                            ]} 
                            onChange={handleNewUserInputChange} 
                            className="w-full" 
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button label="Update User" onClick={handleUpdateUser} className="p-button-success" />
                </div>
            </Dialog>
            </Card>
        </div>
    );
};

export default VetUsers;