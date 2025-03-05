import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import  SideBar  from "./VetLayout";
import axios from "axios";

const VetDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch appointments for the clinic
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/appointments");
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    
    <div className="bg-white p-6 rounded-lg shadow-md">
    <SideBar />
      <h2 className="text-2xl font-bold mb-4">Appointment Schedule</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={appointments.map((apt) => ({
          title: apt.ownerName || "Guest: " + apt.guest_id.firstName, // Display owner or guest name
          start: apt.date,
          allDay: true, // Set to true if the event is all-day
        }))}
        height="600px"
      />
    </div>    
  );
};

export default VetDashboard;