  import { useState, useEffect, useRef } from "react";
  import axios from "axios";
  import { DataTable } from "primereact/datatable";
  import { Column } from "primereact/column";
  import { Toast } from "primereact/toast";
  import { Dropdown } from "primereact/dropdown";
  import { InputText } from "primereact/inputtext";
  import { FilterIcon, SearchIcon } from "lucide-react";
  import "../components/css/VetHistory.css";
  import { useAuth } from "./utils/auth";

  const VetHistory = () => {
    const { role, clinicId } = useAuth();
    const [history, setHistory] = useState([]);
    const toast = useRef(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [statusOptions, setStatusOptions] = useState([
      { label: "Completed", value: "Completed" },
      { label: "Cancelled", value: "Cancelled" }
    ]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [serviceOptions, setServiceOptions] = useState([]);

    useEffect(() => {
      fetchHistory();
      fetchServices();
    }, [clinicId, role]);

    useEffect(() => {
      filterAppointments();
    }, [searchTerm, selectedStatus, selectedService, history]);

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

    const fetchServices = async () => {
      try {
        const url =
          role === "admin"
            ? `http://localhost:5000/api/services` // Fetch all services for admin
            : `http://localhost:5000/api/services/clinic/${clinicId}`; // Fetch services only for this clinic
    
        const response = await axios.get(url);
        const services = response.data;
    
        const formattedServices = services.map(service => ({
          label: service.name,   // 💬 Still using name for dropdown
          value: service.name    // 🔥 value is service.name not id!
        }));
    
        setServiceOptions(formattedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch services",
        });
      }
    };

    const filterAppointments = () => {
      let filtered = [...history];
    
      // Filter by search term
      if (searchTerm) {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter((appt) => {
          const petName = appt.petDetails?.toLowerCase() || "";
          const ownerName = appt.ownerName?.toLowerCase() || "";
          const serviceName = appt.service_id?.name?.toLowerCase() || "";
          return (
            petName.includes(lowercasedSearchTerm) ||
            ownerName.includes(lowercasedSearchTerm) ||
            serviceName.includes(lowercasedSearchTerm)
          );
        });
      }
    
      // Filter by status
      if (selectedStatus) {
        filtered = filtered.filter(
          (appt) => appt.status.toLowerCase() === selectedStatus.toLowerCase()
        );
      }
    
      // Filter by selected service (now by NAME)
      if (selectedService) {
        filtered = filtered.filter(
          (appt) => appt.service_id?.name === selectedService
        );
      }
    
      // Sort by date
      const today = new Date();
      filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const isTodayA = dateA.toDateString() === today.toDateString();
        const isTodayB = dateB.toDateString() === today.toDateString();
        if (isTodayA && !isTodayB) return -1;
        if (!isTodayA && isTodayB) return 1;
        return dateA - dateB;
      });
    
      setFilteredAppointments(filtered);
    };

    const dateTemplate = (rowData) => new Date(rowData.date).toLocaleString();

    // Status legend component with circles for each status
    const statusLegend = (
      <div className="status-legend">
          <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
              <span className="status-circle pending" />
              <span>Pending</span>
          </div>
          <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
              <span className="status-circle confirmed" />
              <span>Confirmed</span>
          </div>
          <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
              <span className="status-circle in-progress" />
              <span>In Progress</span>
          </div>
          <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
              <span className="status-circle ready-for-pickup" />
              <span>Ready for Pickup</span>
          </div>
          <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
              <span className="status-circle completed" />
              <span>Completed</span>
          </div>
          <div className="status-item" style={{ display: "flex", alignItems: "center" }}>
              <span className="status-circle cancelled" />
              <span>Cancelled</span>
          </div>
      </div>
  );

    const formatStatus = (rowData) => {
      return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <span className={`status-circle ${rowData.status.toLowerCase()}`} style={{ marginRight: "8px" }} />
              <span>{rowData.status}</span>
          </div>
      );
  };

    return (
      <div className="vet-history-container">
        <Toast ref={toast} />

        <div className="patients-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="services-title font-bold" style={{ fontSize: "20px", marginBottom: "0px" }}>
              Appointment History
          </h1>
          {statusLegend}
        </div>

        <span className="datatable-line"></span>

        <div className="flex-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FilterIcon size={24} />
        </div>
        <div style={{ position: "relative", flexGrow: 1 }}>
          <Dropdown
            value={selectedStatus}
            options={statusOptions}
            onChange={(e) => setSelectedStatus(e.value)}
            placeholder="Filter by Status"
            className="p-inputtext-sm"
            showClear
            style={{
              height: "45px", 
              padding: "0 10px", 
              fontSize: "14px", 
              minWidth: "150px", 
              marginBottom: "10px"
            }}
          />
        </div>

        {/* Add gap between the two filters */}
        <div style={{ position: "relative", flexGrow: 1 }}>
          <Dropdown
            value={selectedService}
            options={serviceOptions}
            onChange={(e) => setSelectedService(e.value)}
            placeholder="Filter by Services"
            className="p-inputtext-sm"
            showClear
            style={{
              height: "45px", 
              padding: "0 10px", 
              fontSize: "14px", 
              minWidth: "150px", 
              marginBottom: "10px"
            }}
          />
        </div>
      </div>
      <div style={{ position: "relative", minWidth: "250px" }}>
          {/* Search Icon inside input */}
          <SearchIcon size={20} style={{ 
              position: "absolute", 
              top: "40%", 
              left: "10px", 
              transform: "translateY(-50%)", 
              color: "#6c757d" 
          }} />

          {/* Input Text with padding to the left */}
            <InputText 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search"
                style={{ 
                    width: "100%", 
                    paddingLeft: "3.5rem", 
                    maxWidth: "400px"
                }}
            />
        </div>
    </div>

        <div className="table-wrapper">
          <DataTable value={filteredAppointments} paginator rows={50} className="custom-table">
            <Column field="_id" header="Appointment ID" sortable />
            <Column field="ownerName" header="Owner Name" />
            <Column field="petDetails" header="Pet Details" />
            <Column field="service_id.name" header="Service Availed" />
            <Column field="medical_concern" header="Medical Concern" />
            <Column field="status" header="Status" body={formatStatus} />
            <Column field="date" header="Date" body={dateTemplate} sortable />
          </DataTable>
        </div>
      </div>
    );
  };

  export default VetHistory;
