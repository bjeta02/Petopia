import React, { useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "primereact/badge";
import { Menu } from "primereact/menu";
import logo from "../assets/logo.jpg";
import "./css/sidebar.css"
const SidebarLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadMessages, setUnreadMessages] = useState(3);
    const [unreadNotifications, setUnreadNotifications] = useState(5);
    const [unreadTransactions, setUnreadTransactions] = useState(2);
    const menu = useRef(null);

    // Page titles mapping
    const pageTitles = {
        "/": "Dashboard",   
        "/schedules": "Schedules",
        "/appointments": "Appointment Management",
        "/settings": "Settings",
        "/services": "Clinic Management",
        "/history": "Appointment Logs"
    };

    const title = pageTitles[location.pathname] || "Page";

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        navigate("/login");
        window.close();
    };

    // Dropdown menu items
    const menuItems = [
        { label: "🔧 Settings", command: () => navigate("/settings") },
        { separator: true },
        { label: "🚪 Logout", command: handleLogout },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="sidebar-menu">
                    <ul>
                        <li>
                            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                                <i className="pi pi-home"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/appointments" className={({ isActive }) => (isActive ? "active" : "")}>
                                <i className="pi pi-calendar-plus"></i>
                                <span>Manage Appointments</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/schedules" className={({ isActive }) => (isActive ? "active" : "")}>
                                <i className="pi pi-clock"></i>
                                <span>Manage Schedules</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/services" className={({ isActive }) => (isActive ? "active" : "")}>
                                <i className="pi pi-shopping-cart"></i>
                                <span>Manage Clinics</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/logs" className={({ isActive }) => (isActive ? "active" : "")}>
                                <i className="pi pi-shopping-cart"></i>
                                <span>Appointment Log</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-column">
                {/* Fixed Header */}
                <div className="header">
                    <h1 className="header-title">{title}</h1>

                    {/* Icons & Notifications */}
                    <div className="flex gap-4 align-items-center">

                        {/* Dropdown Menu */}
                        <i className="pi pi-bars icon-button" onClick={(e) => menu.current.toggle(e)}></i>
                        <Menu model={menuItems} popup ref={menu} />
                    </div>
                </div>

                {/* Page Content */}
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SidebarLayout;
