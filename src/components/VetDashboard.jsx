import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { FaUsers, FaUserPlus, FaCalendarCheck } from 'react-icons/fa';  
import { Link } from 'react-router-dom';
import './css/VetDashboard.css'; 
import { useAuth } from "./utils/auth"; 

const VetDashboard = () => {
    const { role, clinicId } = useAuth(); 
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [donutData, setDonutData] = useState({
        labels: ['Pending', 'Confirmed', 'In-progress', 'Ready-for-pickup', 'Completed', 'Canceled'],
        datasets: [{
            data: [0, 0, 0, 0, 0, 0], // Initialize with zeros
            backgroundColor: [
                '#ffc107', // Pending
                '#007bff', // Confirmed
                '#FF9800', // In-progress
                '#9c27b0', // Ready-for-pickup
                '#28a745', // Completed
                '#dc3545'  // Canceled
            ],
        }],
    });

            const donutOptions = {
                responsive: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        align: 'start',
                        labels: {
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 550,
                            },
                            boxWidth: 15,
                            boxHeight: 15,
                            padding: 15,
                            maxWidth: 100, 
                        }
                    }
                },
                layout: {
                    padding: {
                        bottom: -10,
                    }
                },
                cutout: '50%'
            };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                let response;
                if (role === "admin") {
                    response = await axios.get('http://localhost:5000/api/appointments');
                } else if (role === "clinic" && clinicId) {
                    response = await axios.get(`http://localhost:5000/api/appointments/clinics/${clinicId}`);
                } else {
                    console.warn("❌ clinicId is null, skipping API call.");
                    return;
                }

                const data = response.data;
                setAppointments(data);

                // Calculate counts for each status
                const statusCounts = {
                    Pending: 0,
                    Confirmed: 0,
                    "In-progress": 0,
                    "Ready-for-pickup": 0,
                    Completed: 0,
                    Canceled: 0,
                };

                data.forEach(app => {
                    if (statusCounts[app.status] !== undefined) {
                        statusCounts[app.status]++;
                    }
                });

                // Update donut data
                setDonutData(prevData => ({
                    ...prevData,
                    datasets: [{
                        ...prevData.datasets[0],
                        data: [
                            statusCounts.Pending,
                            statusCounts.Confirmed,
                            statusCounts["In-progress"],
                            statusCounts["Ready-for-pickup"],
                            statusCounts.Completed,
                            statusCounts.Canceled,
                        ],
                    }],
                }));
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [role, clinicId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    // Get today's date
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    // Filter today's appointments
    const todayAppointments = appointments.filter(app => {
        const appointmentDate = new Date(app.date);
        return app.status === "Confirmed" && appointmentDate.toISOString().split('T')[0] === todayDate;
    });

    // Sort to find the nearest appointment
    const nextPatient = todayAppointments.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    return (
        <div className="clinic-dashboard">
            <div className="grid-container">
                <div className="grid-item">
                    <Card className="header-card">
                        <div className="card-content">
                            <FaUsers className="card-icon" />
                            <div className="info-text">
                                <h3>Total Patients</h3>
                                <p>{appointments.length}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid-item">
                    <Card className="header-card">
                        <div className="card-content">
                            <FaUserPlus className="card-icon" />
                            <div>
                                < h3>Today's Appointments</h3>
                                <p>{todayAppointments.length}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid-item">
                    <Card className="header-card">
                        <div className="card-content">
                            <FaCalendarCheck className="card-icon" />
                            <div>
                                <h3>Pending Appointments</h3>
                                <p>{appointments.filter(app => app.status === "Pending").length}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid-item">
                    <Card className="middle-card">
                        <h3>Patient Summary in Year</h3>
                        <div style={{ marginTop: '20px' }}>
                            <Chart type="doughnut" data={donutData} options={donutOptions} />
                        </div>
                    </Card>
                </div>

                <div className="grid-item">
                    <Card className="middle-card">
                        <h3>Today's Patients</h3>
                        <div className="appointment-list">
                            <div className="appointment-header">
                                <span>Patient</span>
                                <span>Name / Service</span>
                                <span>Time</span>
                            </div>
                            <ul>
                                {todayAppointments.map((patient, index) => (
                                    <li key={index} className="appointment-item">
                                        <div className="patient-profile">
                                            <img src={
                                                patient.pet_id?.avatar && patient.pet_id?.avatar.startsWith("http")
                                                    ? patient.pet_id?.avatar
                                                    : patient.pet_id?.avatar
                                                    ? `http://localhost:5000${patient.pet_id?.avatar}`
                                                    : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                            } alt={patient.pet_id?.name} />
                                        </div>
                                        <div className="patient-info">
                                            <strong>{patient.petDetails}</strong>
                                            <p>{patient.service_id.name}</p>
                                        </div>
                                        <div className="appointment-time">
                                            {new Date(patient.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="see-all-link">
                                <Link to="/vet-appointments">See All</Link>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid-item">
                    <Card className="middle-card">
                        <h3>Next Patient Details</h3>
                        {nextPatient ? (
                            <div className="next-patient-wrapper">
                                <div className="next-patient-header">
                                    <div className="patient-image">
                                        <img src={
                                            nextPatient.pet_id?.avatar && nextPatient.pet_id?.avatar.startsWith("http")
                                                ? nextPatient.pet_id?.avatar
                                                : nextPatient.pet_id?.avatar
                                                ? `http://localhost:5000${nextPatient.pet_id?.avatar}`
                                                : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                        } alt={nextPatient.pet_id?.name} />
                                    </div>
                                    <div className="patient-basic">
                                        <strong>
                                            {nextPatient.pet_id?.name || nextPatient.guest_id?.pets?.[0]?.name || 'Unknown Pet'}
                                        </strong>
                                        <p>{nextPatient.service_id?.name}</p>
                                    </div>
                                </div>

                                <div className="next-patient-details">
                                    <div>
                                        <span>Owner Name:</span>
                                        <p>{nextPatient.ownerName || 'Unknown Owner'}</p>
                                    </div>
                                    <div>
                                        <span>Sex:</span>
                                        <p>
                                            {nextPatient.pet_id?.gender || 
                                            nextPatient.guest_id?.pets?.[0]?.gender || 
                                            'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span>Age:</span>
                                        <p>
                                            {nextPatient.pet_id?.age || 
                                            nextPatient.guest_id?.pets?.[0]?.age || 
                                            'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <span>Breed:</span>
                                        <p>
                                            {nextPatient.pet_id?.breed || 
                                            nextPatient.guest_id?.pets?.[0]?.breed || 
                                            'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <span>Type:</span>
                                        <p>
                                            {nextPatient.pet_id?.type || 
                                            nextPatient.guest_id?.pets?.[0]?.type || 
                                            'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>No upcoming patients for today.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VetDashboard;