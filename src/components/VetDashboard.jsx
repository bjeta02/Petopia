import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const VetDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch appointments for the clinic
    axios.get("http://localhost:5000/api/appointments")
      .then((response) => setAppointments(response.data))
      .catch((error) => console.error("Error fetching appointments:", error));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Appointment Schedule</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={appointments.map((apt) => ({
          title: apt.petOwnerName,
          start: apt.date,
        }))}
        height="600px"
      />
    </div>
  );
};

export default VetDashboard;
