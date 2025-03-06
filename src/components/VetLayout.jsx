import { Outlet, Link } from "react-router-dom";
import "../components/css/VetLayout.css"; // Ensure CSS is imported

const VetLayout = () => {
  return (
    <div className="vet-container">
      {/* Sidebar */}
      <div className="sidebar2">
        <h2>Clinic Panel</h2>
        <ul>
          <li><Link to="/clinic/dashboard">Dashboard</Link></li>
          <li><Link to="/clinic/vetprofile">Clinic</Link></li>
          <li><Link to="/clinic/appointments">Appointments</Link></li>
          <li><Link to="/clinic/history">History</Link></li>
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