import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";

const ClinicProfile = () => {
  const [clinic, setClinic] = useState(null);
  const [allClinics, setAllClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = React.useRef(null);

  const clinicId = localStorage.getItem("clinicId");
  const role = localStorage.getItem("role");

  useEffect(() => {
    let isMounted = true;
  
    const fetchData = async () => {
      if (role === "admin") {
        const response = await axios.get("http://localhost:5000/api/clinics");
        const data = response.data;
        const clinicsArray = Array.isArray(data) ? data : data.clinics || [];
        if (isMounted) setAllClinics(clinicsArray);
      } else if (role === "clinic" && clinicId) {
        const response = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`);
        if (isMounted) setClinic(response.data);
      }
      if (isMounted) setLoading(false);
    };
  
    fetchData();
  
    return () => {
      isMounted = false; // Prevent setting state on unmounted component
    };
  }, [clinicId, role]);
  

  const fetchClinicDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clinics/${id}`);
      setClinic(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching clinic details:", error);
      setLoading(false);
    }
  };

  const fetchAllClinics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/clinics");
      const data = response.data;
      const clinicsArray = Array.isArray(data) ? data : data.clinics || [];
      setAllClinics(clinicsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all clinics:", error);
      setLoading(false);
    }
  };  

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/clinics/update/${id}`, { status });
      toast.current.show({ severity: "success", summary: "Updated", detail: "Status updated successfully" });
      fetchAllClinics();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to update status" });
    }
  };

  const statusBodyTemplate = (rowData) => (
    <span className={`status-tag ${rowData.status?.toLowerCase()}`}>{rowData.status}</span>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      {rowData.status === "Active" ? (
        <Button label="Deactivate" className="p-button-danger" onClick={() => handleStatusUpdate(rowData._id, "Inactive")} />
      ) : (
        <Button label="Activate" className="p-button-success" onClick={() => handleStatusUpdate(rowData._id, "Active")} />
      )}
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <Toast ref={toast} position="bottom-right" />

      {role === "admin" ? (
        <>
          <h2 className="text-2xl font-bold mb-4">All Clinics</h2>
          <DataTable value={allClinics} paginator rows={5} className="shadow-md rounded-lg">
            <Column field="name" header="Clinic Name" />
            <Column field="address" header="Address" />
            <Column field="contact_number" header="Contact" />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
        </>
      ) : clinic ? (
        <div className="bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clinic Name and Logo */}
          <Card className="p-4 text-center">
            <img src={`http://localhost:5000${clinic.logo}`} alt="Clinic Logo" className="w-32 h-32 mx-auto mb-4" />
            <h2 className="text-xl font-bold">{clinic.name}</h2>
          </Card>

          {/* Location and Contact Info */}
          <Card className="p-4">
            <h3 className="text-lg font-bold">Location & Contact</h3>
            <p><strong>Address:</strong> {clinic.address}</p>
            <p><strong>Contact:</strong> {clinic.contact_number}</p>
            <p><strong>Description:</strong> {clinic.description}</p>
            <p><strong>Schedule:</strong> {clinic.days}, {clinic.open_time} - {clinic.close_time}</p>
          </Card>

          <Card className="p-4 md:col-span-2">
            <h3 className="text-lg font-bold">Services Offered</h3>
            <ul className="list-disc list-inside">
              {clinic.services?.map((service, index) => (
                <li key={index}>{service.service_name}</li>
              ))}
            </ul>
          </Card>

          <div className="md:col-span-2 text-center">
            <Button label="Edit Profile" className="p-button-primary mt-3" />
          </div>
        </div>
      ) : (
        <div>No clinic information found.</div>
      )}
    </div>
  );
};

export default ClinicProfile;
