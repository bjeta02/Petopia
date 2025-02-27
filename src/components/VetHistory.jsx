import { useState, useEffect } from "react";
import axios from "axios";

const VetHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments/history")
      .then((response) => setHistory(response.data))
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Appointment History</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Pet</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((apt) => (
            <tr key={apt.id} className="border">
              <td className="p-2 border">{apt.petOwnerName}</td>
              <td className="p-2 border">{apt.petName}</td>
              <td className="p-2 border">{new Date(apt.date).toLocaleString()}</td>
              <td className={`p-2 border ${apt.status === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                {apt.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VetHistory;
