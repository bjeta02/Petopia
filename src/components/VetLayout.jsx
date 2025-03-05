import { Outlet, Link } from "react-router-dom";
import "../components/css/VetLayout.css"; // Ensure CSS is imported

const VetLayout = () => {
  return (
    <div className="vet-container">
      {/* Sidebar */}
      <div className="sidebar2">
        <h2>Clinic Panel</h2>
        <ul>
          <li><Link to="/adminDashboard">Dashboard</Link></li>
          <li><Link to="/adminProfile">Clinic</Link></li>
          <li><Link to="/adminAppointments">Appointments</Link></li>
          <li><Link to="/adminHistory">History</Link></li>
          <li><Link to="/adminUser">History</Link></li>
        </ul>
      </div>

      {/* Content */}
      <main className="vet-content">
        <Outlet />
      </main>
    </div>
  );
};

export default VetLayout;