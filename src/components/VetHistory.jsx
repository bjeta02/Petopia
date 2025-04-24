  import { useState, useEffect, useRef } from "react";
  import axios from "axios";
  import { DataTable } from "primereact/datatable";
  import { Column } from "primereact/column";
  import { Toast } from "primereact/toast";
  import "../components/css/VetHistory.css";
  import { useAuth } from "./utils/auth";

  const VetHistory = () => {
    const { role, clinicId } = useAuth();
    const [history, setHistory] = useState([]);
    const toast = useRef(null);

    useEffect(() => {
      fetchHistory();
    }, [clinicId, role]);

    const fetchHistory = async () => {
      try {
        const url =
          role === "admin"
            ? `http://localhost:5000/api/appointments/`
            : `http://localhost:5000/api/appointments/clinics/${clinicId}`;

        const response = await axios.get(url);

        const filteredHistory = response.data.filter(
          (appointment) =>
            appointment.status === "Completed" || appointment.status === "Cancelled"
        );

        setHistory(filteredHistory);
      } catch (error) {
        if (!role) {
          console.error("No role found in localStorage.");
          return;
        }
        console.error("Error fetching history:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch history",
        });
      }
    };

    const dateTemplate = (rowData) => new Date(rowData.date).toLocaleString();

    return (
      <div className="vet-history-container">
        <Toast ref={toast} />
        <h2 className="table-title">Appointment History</h2>

        <div className="table-wrapper">
          <DataTable value={history} paginator rows={50} className="custom-table">
            <Column field="_id" header="Appointment ID" sortable />
            <Column field="ownerName" header="Owner Name" />
            <Column field="petDetails" header="Pet Details" />
            <Column field="service_id.name" header="Service Availed" />
            <Column field="status" header="Status" />
            <Column field="date" header="Date" body={dateTemplate} sortable />
          </DataTable>
        </div>
      </div>
    );
  };

  export default VetHistory;
