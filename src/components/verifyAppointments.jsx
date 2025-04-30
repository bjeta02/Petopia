import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/utils/auth";
import VerificationQRCode from "../components/VerificationQRCode";
import "./css/verifyAppointment.css"; // ⬅️ Import the CSS

const VerifyAppointment = () => {
  const auth = useAuth();
  const role = auth?.role || null;
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (appointmentId) {
      axios
        .get(`http://localhost:5000/api/appointments/qr/${appointmentId}`)
        .then((res) => setAppointment(res.data))
        .catch((err) => console.error(err));
    }
  }, [appointmentId]);

  const updateStatus = async (status) => {
    try {
      await axios.put(`http://localhost:5000/appointments/update/${appointmentId}`, { status });
      alert(`Appointment marked as ${status}`);
      navigate("/vet-appointments");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!appointment) {
    return (
      <div className="verify-container">
        <p className="loading-text">Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2 className="verify-title">📅 Verify Appointment</h2>

        <div className="info">
          <p><strong>🐶 Pet:</strong> {appointment.petDetails}</p>
          <p><strong>🐶 Service:</strong> {appointment.service_id.name}</p>
          <p><strong>👤 Owner:</strong> {appointment.ownerName}</p>
          <p><strong>📆 Date:</strong> {appointment.date}</p>
        </div>

        {role === "clinic" ? (
          <div className="button-group">
            <button
              className="verify-button accept"
              onClick={() => updateStatus("In-Progress")} // ← Changed from "confirmed"
            >
              Start Appointment
            </button>
          </div>
        ) : (
          <p className="note">
            ⚠️ You do not have permission to modify this appointment.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyAppointment;