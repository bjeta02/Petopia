import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { User, Dog, ClipboardList } from "lucide-react"; // Icons
import "../components/css/VetDashboard.css";

const VetDashboard = () => {
  const clinicId = localStorage.getItem("clinicId");
  const role = localStorage.getItem("role");
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isAddDialogVisible, setIsAddDialogVisible] = useState(false);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Form State for Adding Appointment
  const [newAppointment, setNewAppointment] = useState({
    ownerName: "",
    petName: "",
    petType: "",
    services: "",
    date: null,
  });

  useEffect(() => {
    console.log("Clinic ID:", clinicId, "Role:", role); // 🧪 add this

    if (clinicId && role === "clinic") {
      fetchOwners();
    }

    fetchAppointments();
  }, [clinicId, role]);

  const fetchOwners = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/appointments/owners/${clinicId}`);
      setOwners(response.data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const fetchAppointments = async () => {
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

  const handleOwnerSelect = (e) => {
    const ownerId = e.value;
    const owner = owners.find(o => o._id === ownerId);
    console.log("Selected Owner:", owner);
    
    // Set the selected owner ID and their pets
    setSelectedOwnerId(ownerId);
    setPets(owner?.pets || []);
    
    // Update the newAppointment state with the owner's name
    setNewAppointment({ 
      ...newAppointment,
      ownerId,
      ownerName: `${owner?.firstname} ${owner?.lastname}`, // Set the owner's full name
    });
  
    // Set the available services for the selected owner
    const services = owner?.services || []; // Assuming services are part of the owner object
    console.log("Available Services:", services); // Debugging line
    setAvailableServices(services);
  };
  
  const handlePetSelect = (e) => {
    const petId = e.value;
    const pet = pets.find(p => p._id === petId);
    setSelectedPetId(petId);
    setNewAppointment({
      ...newAppointment,
      petId,
      petName: pet.name,
      petType: pet.type,
    });
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

  const handleAddAppointment = async () => {
    if (!selectedOwnerId || !selectedPetId || !selectedServiceId || !newAppointment.date) {
      alert("Please fill out all required fields.");
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:5000/api/appointments/clinic-book`, {
        owner_id: selectedOwnerId._id || selectedOwnerId,
        pet_id: selectedPetId,
        clinic_id: clinicId,
        service_id: selectedServiceId,
        date: newAppointment.date.toISOString(),
        // Optional:
        vet_id: null,      // or pass actual vet if applicable
        notes: "",         // or pass a note if you support it
      });
  
      setAppointments([...appointments, response.data.appointment]); // fixed .appointment
      setIsAddDialogVisible(false);
      resetAddAppointmentForm(); // Reset the form after adding
    } catch (error) {
      console.error("Error adding appointment:", error);
      alert("Error adding appointment. Please try again.");
    }
  };

  // Function to reset the form
  const resetAddAppointmentForm = () => {
    setNewAppointment({
      ownerName: "",
      petName: "",
      petType: "",
      services: "",
      date: null,
    });
    setSelectedOwnerId(null);
    setSelectedPetId(null);
    setSelectedServiceId(null);
    setAvailableServices([]); // Reset available services
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Appointment Schedule</h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* Add Appointment Button (Only for Clinics) */}
      {role === "clinic" && (
        <Button label="Add Appointment" className="mb-4" onClick={() => setIsAddDialogVisible(true)} />
      )}

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
        header={<span className="text-lg font-semibold">Appointment Details</span>}
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        className="p-4"
      >
        <div className="space-y-4">
          {selectedAppointments.map((apt, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-100">
              <p className="flex items-center gap-2 text-lg font-medium">
                <User  size={18} className="text-blue-500" /> {apt.ownerName || "Guest"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Dog size={18} className="text-green-500" /> {apt.petDetails || "No Pets"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <ClipboardList size={18} className="text-purple-500" /> {apt.service_id?.name || "No Services Listed"}
              </p>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Add Appointment Modal */}
      <Dialog
          header="Add Appointment"
          visible={isAddDialogVisible}
          onHide={() => {
            setIsAddDialogVisible(false);
            resetAddAppointmentForm(); // Reset the form when closing the modal
          }}
          className="p-4"
        >
          <div className="add-appointment space-y-3">
            <Dropdown
              value={selectedOwnerId}
              options={owners.map(o => ({ label: `${o.firstname} ${o.lastname}`, value: o._id }))}
              placeholder="Select Owner"
              className="w-full"
              onChange={handleOwnerSelect}
            />

            <Dropdown
              value={selectedPetId}
              options={pets.map(p => ({ label: p.name, value: p._id }))}
              placeholder="Select Pet"
              className="w-full"
              onChange={handlePetSelect}
              disabled={!selectedOwnerId} // Enable only if an owner is selected
            />

            <Dropdown
              value={selectedServiceId}
              options={availableServices.map(s => 
                typeof s === 'string' 
                  ? { label: s, value: s } 
                  : { label: s.name, value: s._id }
              )}
              placeholder="Select Service"
              className="w-full"
              onChange={(e) => {
                const selected = availableServices.find(s => 
                  typeof s === 'string' ? s === e.value : s._id === e.value
                );
                
                setSelectedServiceId(e.value);
                setNewAppointment({
                  ...newAppointment,
                  services: typeof selected === 'string' ? selected : selected.name,
                });
              }}
              disabled={!availableServices.length} // Disable if no services are available
            />

            <Calendar
              placeholder ="Select Date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.value })}
              showIcon
              className="w-full"
            />

            <Button label="Add Appointment" className="w-full" onClick={handleAddAppointment} />
          </div>
        </Dialog>
    </div>
  );
};

export default VetDashboard;