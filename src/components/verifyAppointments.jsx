import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/utils/auth"; // Assuming you have auth context
import VerificationQRCode from "../components/VerificationQRCode";

const VerifyAppointment = () => {
  const auth = useAuth();
  const role = auth?.role || null; // Ensure role exists    
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (appointmentId) {
      axios.get(`http://localhost:5000/api/appointments/qr/${appointmentId}`)
        .then(res => setAppointment(res.data))
        .catch(err => console.error(err));
    }
  }, [appointmentId]);

  const updateStatus = async (status) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}`, { status });
      alert(`Appointment marked as ${status}`);
      navigate("/dashboard"); // Redirect after update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!appointment) return <p>Loading...</p>;

  return (
    <div>
      <h2>Verify Appointment</h2>
      <VerificationQRCode appointmentId={appointmentId} />
      <p>Pet: {appointment.petDetails}</p> {/* or petName if you decide to use it */}
      <p>Owner: {appointment.ownerName}</p>
      <p>Date: {appointment.date}</p>

      {/* Show Accept/Reject buttons only to clinics */}
      {role === "clinic" && (
        <>
          <button onClick={() => updateStatus("confirmed")}>✅ Accept</button>
          <button onClick={() => updateStatus("rejected")}>❌ Reject</button>
        </>
      )}

      {/* Optionally, you can show a message for non-clinic users */}
      {role !== "clinic" && (
        <p>You do not have permission to modify this appointment.</p>
      )}
    </div>
  );
};

export default VerifyAppointment;