import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import "../components/css/VetHistory.css"; // Import CSS

const VetHistory = () => {
  const [history, setHistory] = useState([]);
  const toast = useRef(null);

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
    <div className="vet-history-container">
      <Toast ref={toast} />
      <h2 className="table-title">Appointment History</h2>

      <div className="table-wrapper">
        <DataTable value={history} paginator rows={5} className="custom-table">
          <Column field="_id" header="Appointment ID" sortable />
          <Column field="ownerName" header="Owner Name" />
          <Column field="petDetails" header="Pet Details" />
          <Column field="service_id.name" header="Service Availed" />
          <Column field="date" header="Date" body={dateTemplate} sortable />
        </DataTable>
      </div>
    </div>
  );
};

export default VetHistory;
