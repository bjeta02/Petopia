import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { ListBox } from "primereact/listbox";

const ClinicProfile = () => {
  const [clinic, setClinic] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [updatedClinic, setUpdatedClinic] = useState({
    name: "",
    address: "",
    contact_number: "",
    description: "",
    logo: "",
    services: [],
    days: "",
    open_time: "",
    close_time: "",
  });

  useEffect(() => {
    fetchClinicProfile();
  }, []);

  const fetchClinicProfile = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/clinic/profile");
      setClinic(response.data);
      setUpdatedClinic(response.data);
    } catch (error) {
      console.error("Error fetching clinic profile:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put("http://localhost:5000/api/clinic/profile", updatedClinic);
      setClinic(updatedClinic);
      setEditDialog(false);
    } catch (error) {
      console.error("Error updating clinic profile:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {clinic ? (
        <Card title={clinic.name} subTitle={clinic.address} className="mb-4">
          <img src={clinic.logo} alt="Clinic Logo" className="w-32 h-32 mb-4" />
          <p><strong>Contact:</strong> {clinic.contact_number}</p>
          <p><strong>Description:</strong> {clinic.description}</p>
          <p><strong>Services:</strong></p>
          <ul>
            {clinic.services.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
          <p><strong>Schedule:</strong> {clinic.days}, {clinic.open_time} - {clinic.close_time}</p>
          <Button label="Edit Profile" className="p-button-primary mt-3" onClick={() => setEditDialog(true)} />
        </Card>
      ) : (
        <p>Loading clinic profile...</p>
      )}

      {/* Edit Dialog */}
      <Dialog visible={editDialog} header="Edit Clinic Profile" onHide={() => setEditDialog(false)}>
        <div className="p-fluid">
          <label>Clinic Name</label>
          <InputText value={updatedClinic.name} onChange={(e) => setUpdatedClinic({ ...updatedClinic, name: e.target.value })} />

          <label>Address</label>
          <InputText value={updatedClinic.address} onChange={(e) => setUpdatedClinic({ ...updatedClinic, address: e.target.value })} />

          <label>Contact Number</label>
          <InputText value={updatedClinic.contact_number} onChange={(e) => setUpdatedClinic({ ...updatedClinic, contact_number: e.target.value })} />

          <label>Description</label>
          <InputText value={updatedClinic.description} onChange={(e) => setUpdatedClinic({ ...updatedClinic, description: e.target.value })} />

          <label>Logo URL</label>
          <InputText value={updatedClinic.logo} onChange={(e) => setUpdatedClinic({ ...updatedClinic, logo: e.target.value })} />

          <label>Services</label>
          <ListBox multiple value={updatedClinic.services} options={["Vaccination", "Grooming", "Check-ups", "Surgery"]} onChange={(e) => setUpdatedClinic({ ...updatedClinic, services: e.value })} />

          <label>Days Open</label>
          <InputText value={updatedClinic.days} onChange={(e) => setUpdatedClinic({ ...updatedClinic, days: e.target.value })} />

          <label>Open Time</label>
          <Calendar value={updatedClinic.open_time ? new Date(`1970-01-01T${updatedClinic.open_time}`) : null} onChange={(e) => setUpdatedClinic({ ...updatedClinic, open_time: e.value.toTimeString().split(" ")[0] })} timeOnly />

          <label>Close Time</label>
          <Calendar value={updatedClinic.close_time ? new Date(`1970-01-01T${updatedClinic.close_time}`) : null} onChange={(e) => setUpdatedClinic({ ...updatedClinic, close_time: e.value.toTimeString().split(" ")[0] })} timeOnly />
        </div>

        <div className="p-dialog-footer">
          <Button label="Cancel" className="p-button-secondary" onClick={() => setEditDialog(false)} />
          <Button label="Save" className="p-button-primary" onClick={handleSaveProfile} />
        </div>
      </Dialog>
    </div>
  );
};

export default ClinicProfile;
