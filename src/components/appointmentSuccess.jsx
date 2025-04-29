import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import './css/appointmentSuccess.css';
import checkImage from '../assets/check.jpg';

export default function AppointmentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointment } = location.state || {};
  
  // State to toggle the visibility of appointment details
  const [showDetails, setShowDetails] = useState(false);
  const [topMargin, setTopMargin] = useState('0'); // Default margin-top is 0

  const handleContinue = () => {
    navigate('/home');
  };

  const handleViewAppointment = () => {
    setShowDetails(!showDetails); // Toggle the visibility of appointment details
    setTopMargin(showDetails ? '0' : '150px'); // Set margin based on visibility
  };

  if (!appointment) {
    return (
      <div className="appointment-success-container" style={{ marginTop: topMargin }}>
        <Card className="appointment-card">
          <p className="text-lg text-gray-700">No appointment data found.</p>
          <Button 
            label="Go Back"
            onClick={handleContinue}
            className="continue-button"
            style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="appointment-success-container" style={{ marginTop: topMargin }}>
      <Card className="appointment-card">
        {/* Check Icon */}
        <div className="check-icon">
          <img src={checkImage} alt="Check Icon" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-green-600 mb-8" style={{ marginTop: '30px' }}>
          Appointment Successfully!
        </h1>
        <p style={{ fontSize: '15px' }}>Your appointment ID is: {appointment.appointmentId}</p>

        <p className="thank-you-message">
          Thank you for booking your appointment with us! We look forward to seeing you and your pet.
        </p>

        {/* Appointment Details */}
        {showDetails && (
          <div className="appointment-details">
            <div><strong>Clinic Name:</strong> {appointment.clinicName}</div>
            <div><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
            <div><strong>Service Availed:</strong> {appointment.service?.name}</div>
            <div><strong>Owner name:</strong> {appointment.ownerName}</div>
            <div><strong>Email:</strong> {appointment.ownerEmail}</div>
            <div><strong>Pet name:</strong> {appointment.petName}</div>
            <div><strong>Pet type:</strong> {appointment.petType}</div>
            <div><strong>Pet breed:</strong> {appointment.petBreed}</div>
            <div><strong>Pet gender:</strong> {appointment.petGender}</div>
            <div><strong>Pet age:</strong> {appointment.petAge} years old</div>
          </div>
        )}

        {/* Buttons */}
        <div className="button-group">
          <Button
            label={showDetails ? "Hide Appointment" : "View Appointment"}
            onClick={handleViewAppointment}
            className="view-appointment-button"
          />
          <Button
            label="Continue"
            onClick={handleContinue}
            className="continue-button"
          />
        </div>
      </Card>
    </div>
  );
}