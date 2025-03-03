import { useState, useEffect, useRef } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

const VetHistory = () => {
  const [history, setHistory] = useState([]);
  const toast = useRef(null); // ✅ Correct ref initialization

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/appointments");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      if (toast.current) {
        toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch history" });
      }
    }
  };

  // Format Date
  const dateTemplate = (rowData) => new Date(rowData.date).toLocaleString();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Toast ref={toast} /> 
      <h2 className="text-2xl font-bold mb-4">Appointment History</h2>

      <DataTable value={history} paginator rows={6} className="datatable">
        <Column field="_id" header="Appointment ID" sortable />
        <Column field="ownerName" header="Owner Name" />
        <Column field="petDetails" header="Pet Details" />
        <Column field="service_id.name" header="Service Availed" />
        <Column field="status" header="Status" />
        <Column field="date" header="Date" body={dateTemplate} sortable />
      </DataTable>
    </div>
  );
};

export default VetHistory;