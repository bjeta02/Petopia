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
import { Card } from 'primereact/card';
import { User, Dog, ClipboardList } from "lucide-react"; // Icons
import "../components/css/vetSchedules.css";
import { useAuth } from "./utils/auth"


const VetSchedules = () => {
  const { role, clinicId } = useAuth();
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
    console.log("Clinic ID:", clinicId, "Role:", role); // 🧪 add this

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

    if (role !== "admin" && !clinicId) {
      console.warn("❌ clinicId is null, skipping API call.");
      return; // Stop the function if there's no clinicId for non-admins
    }
    try {
      let response;
      if (role === "admin") {
        response = await axios.get(`http://localhost:5000/api/appointments/`);
      } else if (role === "clinic") {
        if (!clinicId) {
          setError("Clinic ID is not available for this role.");
          return;
        }
        response = await axios.get(`http://localhost:5000/api/appointments/clinics/${clinicId}`);
      } else {
        setError("Invalid role.");
        return;
      }
  
      if (!response || !response.data) {
        setError("No appointments found.");
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
  
    setSelectedOwnerId(ownerId);
    setPets(owner?.pets || []);
    setAvailableServices(owner?.services || []);
  
    setNewAppointment((prev) => ({
      ...prev,
      ownerId,
      ownerName: owner ? `${owner.firstname} ${owner.lastname}` : "",
    }));
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
        status: "confirmed",
        // Optional:
        vet_id: null,      // or pass actual vet if applicable
        notes: "",         // or pass a note if you support it
      });
  
      setAppointments([...appointments, response.data.appointment]); // fixed .appointment
      setIsAddDialogVisible(false);
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
    } catch (error) {
      console.error("Error adding appointment:", error);
      alert("Error adding appointment. Please try again.");
    }
  };
  

  return (
    <div>
     <Card style={{ borderRadius: '10px', padding: '0', marginBottom: '1.5rem', height: '80px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'}}>
        <div className="header-row">
          <h3 className="appointment-title">APPOINTMENT SCHEDULE</h3>
          {role === "clinic" && (
            <Button 
              label="+ Add Appointment" 
              className="addapp-button" 
              onClick={() => setIsAddDialogVisible(true)} 
            />
          )}
        </div>
      </Card>
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
                <User size={20} className="text-blue-500" /> {apt.ownerName || "Guest"}
              </p>
              
              {/* Pet Details */}
              <p className="flex items-center gap-3 text-gray-700 mt-2">
                <Dog size={20} className="text-green-500" />
                <span className="font-medium">{apt.petDetails || "No Pets"}</span>
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




      <Dialog
          header="Add Appointment"
          visible={isAddDialogVisible}
          onHide={() => setIsAddDialogVisible(false)}
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
                  disabled={!selectedOwnerId}
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
                  disabled={!availableServices.length}
              />

              <Calendar
                  placeholder="Select Date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.value })}
                  showIcon
                  className="w-full"
              />

              <Button label="Add Appointment" className="addapp-button" onClick={handleAddAppointment} />
          </div>
      </Dialog>
    </div>
    </div>
  );
};

export default VetSchedules;


