import { Outlet, NavLink } from "react-router-dom";
import "../components/css/VetLayout.css"; // Ensure CSS is imported

const VetLayout = () => {
  return (
    <div className="vet-container">
      <div className="sidebar2">
        <h1>Clinic Panel</h1>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/vetprofile" className={({ isActive }) => (isActive ? "active" : "")}>
              Clinic
            </NavLink>
          </li>
          <li>
            <NavLink to="/appointments" className={({ isActive }) => (isActive ? "active" : "")}>
              Appointments
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
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