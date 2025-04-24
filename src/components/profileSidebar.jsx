import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Dog,
  CalendarCheck
} from "lucide-react"; // Importing icons

import "../components/css/profileSidebar.css";

const profileSidebar = () => {
  return (
    <div className="pet-container">
      <div className="pet-sidebar2">
        <ul>
          <li>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              <User size={18} style={{ marginRight: 8 }} />
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/pet-profile" className={({ isActive }) => (isActive ? "active" : "")}>
              <Dog size={18} style={{ marginRight: 8 }} />
              My Pets
            </NavLink>
          </li>
          <li>
            <NavLink to="/pet-schedules" className={({ isActive }) => (isActive ? "active" : "")}>
              <CalendarCheck size={18} style={{ marginRight: 8 }} />
              Schedules
            </NavLink>
          </li>
          <li>
            <NavLink to="/pet-appointments" className={({ isActive }) => (isActive ? "active" : "")}>
              <CalendarCheck size={18} style={{ marginRight: 8 }} />
              Appointments
            </NavLink>
          </li>
        </ul>
      </div>

      <main className="pet-content">
        <Outlet />
      </main>
    </div>
  );
};

export default profileSidebar;
