import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const VetDashboard = () => {
  const clinicId = localStorage.getItem("clinicId");
  const role = localStorage.getItem("role");
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null); // State to hold error messages

  useEffect(() => {
    // Fetch appointments for the clinic
    const fetchAppointments = async () => {
      console.log("Role:", role); // Log the role
      console.log("Clinic ID:", clinicId); // Log the clinicId

      // Check role and clinicId
      if (role === "admin") {
        // Admin role, do not use clinicId
        try {
          const response = await axios.get(`http://localhost:5000/api/appointments/`);
          const filteredAppointments = response.data.filter(appt => {
            const status = appt.status ? appt.status.toLowerCase() : "";
            return status === "pending" || status === "confirmed"; // Adjusted to include confirmed appointments
          });
          setAppointments(filteredAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setError("Error fetching appointments. Please try again later."); // Set error message
        }
      } else if (role === "clinic" && clinicId) {
        // Clinic role, use clinicId
        try {
          const response = await axios.get(`http://localhost:5000/api/appointments/clinics/${clinicId}`);
          const filteredAppointments = response.data.filter(appt => {
            const status = appt.status ? appt.status.toLowerCase() : "";
            return status === "pending" || status === "confirmed"; // Adjusted to include confirmed appointments
          });
          setAppointments(filteredAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setError("Error fetching appointments. Please try again later."); // Set error message
        }
      } else {
        setError("Clinic ID is not available for this role."); // Handle case where clinicId is not available
      }
    };

    fetchAppointments();
  }, [clinicId, role]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Appointment Schedule</h2>
      {error && <p className="text-red-500">{error}</p>} {/* Display error message if exists */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={appointments.map((apt) => ({
          title: apt.ownerName || "Guest: " + (apt.guest_id ? apt.guest_id.firstName : "Unknown"), // Display owner or guest name
          start: apt.date,
          allDay: true, // Set to true if the event is all-day
        }))}
        height="600px"
      />
    </div>
  );
};

export default VetDashboard;