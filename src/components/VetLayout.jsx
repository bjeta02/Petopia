import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  History,
  Clock, // Assuming you want to use a clock icon for schedules
  Settings,
  Users
} from "lucide-react"; // Importing icons

import "../components/css/VetLayout.css";
import { useAuth } from './utils/auth'; // Assuming you have an auth context or hook

const VetLayout = () => {
  const { role } = useAuth();

  return (
    <div className="vet-container">
      <div className="sidebar2">
        <ul>
          <li>
            <NavLink to="/vet-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <LayoutDashboard size={18} style={{ marginRight: 8 }} />
              Dashboard 
            </NavLink>
          </li>
          <li>
          <NavLink 
            to="/vet-profile" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Home size={18} style={{ marginRight: 8 }} />
            {role === "admin" ? "Manage Clinics" : "Profile"}
          </NavLink>
          </li>
          {role === "admin" && (
          <li>
            <NavLink to="/vet-service" className={({ isActive }) => (isActive ? "active" : "")}>
              <Settings size={18} style={{ marginRight: 8 }} />
              Services
            </NavLink>
          </li>
          )}
          {role === "admin" && (
          <li>
            <NavLink to="/vet-users" className={({ isActive }) => (isActive ? "active" : "")}>
              <Users size={18} style={{ marginRight: 8 }} />
              Users
            </NavLink>
          </li>
          )}
          <li>
            <NavLink to="/vet-patients" className={({ isActive }) => (isActive ? "active" : "")}>
              <History size={18} style={{ marginRight: 8 }} />
              Patients
            </NavLink>
          </li>
          <li>
            <NavLink to="/vet-appointments" className={({ isActive }) => (isActive ? "active" : "")}>
              <CalendarCheck size={18} style={{ marginRight: 8 }} />
              Appointments
            </NavLink>
          </li>
          <li>
            <NavLink to="/vet-schedules" className={({ isActive }) => (isActive ? "active" : "")}>
              <Clock size={18} style={{ marginRight: 8 }} /> {/* Using Clock icon for Schedules */}
              Schedules
            </NavLink>
          </li>
          <li>
            <NavLink to="/vet-history" className={({ isActive }) => (isActive ? "active" : "")}>
              <History size={18} style={{ marginRight: 8 }} />
              History
            </NavLink>
          </li>
        </ul>
      </div>

      <main className="vet-content">
        <Outlet />
      </main>
    </div>
  );
};

export default VetLayout;