import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { User, Dog, ClipboardList, X } from "lucide-react"; // Import icons

const VetDashboard = () => {
  const clinicId = localStorage.getItem("clinicId");
  const role = localStorage.getItem("role");
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      console.log("Role:", role);
      console.log("Clinic ID:", clinicId);

      try {
        let response;
        if (role === "admin") {
          response = await axios.get(`http://localhost:5000/api/appointments/`);
        } else if (role === "clinic" && clinicId) {
          response = await axios.get(`http://localhost:5000/api/appointments/clinics/${clinicId}`);
        } else {
          setError("Clinic ID is not available for this role.");
          return;
        }

        const filteredAppointments = response.data.filter(appt => {
          const status = appt.status ? appt.status.toLowerCase() : "";
          return status === "pending" || status === "confirmed";
        });

        setAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Error fetching appointments. Please try again later.");
      }
    };

    fetchAppointments();
  }, [clinicId, role]);

  // Group appointments by date
  const groupedAppointments = appointments.reduce((acc, apt) => {
    const date = apt.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {});

  // Format data for FullCalendar
  const calendarEvents = Object.keys(groupedAppointments).map((date) => ({
    title: `${groupedAppointments[date].length} Appointments`,
    start: date,
    allDay: true,
    extendedProps: { details: groupedAppointments[date] },
  }));

  // Show details when clicking on an event
  const handleEventClick = (info) => {
    setSelectedAppointments(info.event.extendedProps.details);
    setIsDialogVisible(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Appointment Schedule</h2>
      {error && <p className="text-red-500">{error}</p>}

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        eventClick={handleEventClick}
        height="600px"
        eventContent={(eventInfo) => (
          <div style={{ cursor: "pointer" }}>
            {eventInfo.event.title}
          </div>
        )}
      />

      {/* Modal for displaying appointment details */}
      <Dialog
        header={<span className="text-lg font-semibold">Appointment Details</span>}
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        className="p-4"
      >
        <div className="space-y-4">
          {selectedAppointments.map((apt, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-100">
              <p className="flex items-center gap-2 text-lg font-medium">
                <User size={18} className="text-blue-500" /> {apt.ownerName || "Guest"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Dog size={18} className="text-green-500" /> {apt.pet?.name || "No Name"} ({apt.pet?.type || "Unknown"})
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <ClipboardList size={18} className="text-purple-500" /> {apt.services?.join(", ") || "No Services Listed"}
              </p>
            </div>
          ))}
        </div>
      </Dialog>

    </div>
  );
};

export default VetDashboard;
