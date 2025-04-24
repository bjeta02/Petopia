import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { User, Dog, ClipboardList } from "lucide-react"; // Icons
import "../components/css/petSchedules.css";
import { useAuth } from "./utils/auth"


const PetSchedules = () => {
  const { role, ownerId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);

  
  // Form State for Adding Appointment
  const [newAppointment, setNewAppointment] = useState({
    ownerName: "",
    petName: "",
    petType: "",
    services: "",
    date: null,
  });

  useEffect(() => {
    fetchAppointments();
  }, [ownerId, role]);


  const fetchAppointments = async () => {
    try {
      
      const response = await axios.get(`http://localhost:5000/api/appointments/${ownerId}`);
  
      if (!response || !response.data) {
        setError("No appointments found.");
        return;
      }

      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Error fetching appointments. Please try again later.");
    }
  };

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
    <div className="schedule-container">
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

      {/* Appointment Details Modal */}
      <Dialog
        header={
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-800">Appointment Details</span>
          </div>
        }
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        className="p-6 rounded-xl bg-white shadow-lg"
        style={{ width: "400px", maxWidth: "90%" }}
      >
        <div className="space-y-6">
          {selectedAppointments.map((apt, index) => (
            <div key={index} className="relative bg-white p-5 rounded-xl shadow-md border border-gray-300">
              {/* Owner Name */}
              <p className="flex items-center gap-3 text-lg font-semibold text-blue-600">
                <User size={20} className="text-blue-500" /> {apt.owner_id?.firstname || "Guest"} {apt.owner_id?.lastname || "lastname"}
              </p>
              
              {/* Pet Details */}
              <p className="flex items-center gap-3 text-gray-700 mt-2">
                <Dog size={20} className="text-green-500" />
                <span className="font-medium">
                {apt.pet_id
                    ? `${apt.pet_id.name} (${apt.pet_id.type || "Unknown Type"})`
                    : "No Pets"}
                </span>
              </p>

              {/* Service Name */}
              <p className="flex items-center gap-3 text-gray-700 mt-2">
                <ClipboardList size={20} className="text-purple-500" />
                <span className="font-medium">{apt.service_id?.name || "No Services Listed"}</span>
              </p>

              {/* Separator for multiple appointments */}
              {index < selectedAppointments.length - 1 && (
                <div className="relative flex justify-center items-center my-6">
                  <div className="w-3/4 border-t border-gray-300"></div>
                  <span className="absolute bg-white px-2 text-gray-500 text-sm">- - - - - - - - - - - - - - - - - -</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
};

export default PetSchedules;