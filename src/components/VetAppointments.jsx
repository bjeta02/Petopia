import { useState, useEffect } from "react";
import axios from "axios";

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    axios.get("http://localhost:5000/api/appointments/pending")
      .then((response) => setAppointments(response.data))
      .catch((error) => console.error("Error fetching appointments:", error));
  };

  const updateAppointmentStatus = (id, status) => {
    axios.put(`http://localhost:5000/api/appointments/${id}`, { status })
      .then(() => fetchAppointments())
      .catch((error) => console.error("Error updating appointment:", error));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Pending Appointments</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Pet</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id} className="border">
              <td className="p-2 border">{apt.petOwnerName}</td>
              <td className="p-2 border">{apt.petName}</td>
              <td className="p-2 border">{new Date(apt.date).toLocaleString()}</td>
              <td className="p-2 border">
                <button onClick={() => updateAppointmentStatus(apt.id, "Accepted")} className="px-4 py-1 bg-green-500 text-white rounded mr-2">Accept</button>
                <button onClick={() => updateAppointmentStatus(apt.id, "Rejected")} className="px-4 py-1 bg-red-500 text-white rounded">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VetAppointments;
