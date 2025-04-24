    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { Card } from 'primereact/card';
    import { Button } from 'primereact/button';
    import { Calendar } from 'primereact/calendar';
    import { Chart } from 'primereact/chart';
    import { FaUsers, FaUserPlus, FaCalendarCheck } from 'react-icons/fa';  // Import icons
    import { Link } from 'react-router-dom';
    import './css/VetDashboard.css'; // Import your custom CSS for styling
    import { useAuth } from "./utils/auth"; // Import useAuth to get role and clinicId

    const VetSchedules = () => {
        const { role, clinicId } = useAuth(); // Get role and clinicId from auth context
        const [appointments, setAppointments] = useState([]);
        const [newPatients, setNewPatients] = useState([]);
        const [loading, setLoading] = useState(true);

        const [donutData, setDonutData] = useState({
            labels: ['Guest Patients', 'Returning Patients', 'Pending Patients'],
            datasets: [{
                data: [0, 0, 0], // Initialize with zeros
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
                hoverBackgroundColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
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
                        response = await axios.get('http://localhost:5000/api/appointments'); // Fetch all appointments for admin
                    } else if (role === "clinic" && clinicId) {
                        response = await axios.get(`http://localhost:5000/api/appointments/clinics/${clinicId}`); // Fetch appointments for specific clinic
                    } else {
                        console.warn("❌ clinicId is null, skipping API call.");
                        return; // Stop the function if there's no clinicId for non-admins
                    }
    
                    const data = response.data;
                    setAppointments(data); // Set all fetched appointments here
    
                    // Calculate counts for the donut chart
                    const guestPatientsCount = data.filter(app => app.status === "Confirmed" && app.owner?.isGuest).length; // Assuming isNew is a property to identify new patients
                    const returningPatientsCount = data.filter(app => app.status === "Confirmed" && !app.owner?.isGuest).length; // Assuming returning patients are those who are not new
                    const pendingPatientsCount = data.filter(app => app.status === "Pending").length;
    
                   // Update donut data
                    setDonutData(prevData => ({
                        ...prevData,
                        datasets: [{
                            ...prevData.datasets[0],
                            data: [guestPatientsCount, returningPatientsCount, pendingPatientsCount],
                        }],
                    }));
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                } finally {
                    setLoading(false); // Set loading to false after fetching
                }
            };
    
            fetchAppointments();
        }, [role, clinicId]); // Fetch appointments when role or clinicId changes

        if (loading) {
            return <p>Loading...</p>; // Show loading state
        }

        // Calculate upcoming appointments and pending appointments
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];

        const upcomingAppointments = appointments.filter(app => 
            app.status === "Confirmed" && new Date(app.date) >= today
        );

        const pendingAppointments = appointments.filter(app => 
            app.status === "Pending" && new Date(app.date) >= today
        );

        // Get the next 4 confirmed patients
        const nextPatients = newPatients.slice(0, 4);

        return (
            <div className="clinic-dashboard">
                <div className="grid-container">
                    {/* First Row (Header) */}
                    <div className="grid-item">
                        <Card className="header-card">
                            <div className=" card-content">
                                <div className="icon-wrapper">
                                    <FaUsers className="card-icon" />
                                </div>
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
                                <div className="icon-wrapper">
                                    <FaUserPlus className="card-icon" />
                                </div>
                                <div>
                                    <h3>Upcoming Appointments</h3>
                                    <p>{upcomingAppointments.length}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid-item">
                        <Card className="header-card">
                            <div className="card-content">
                                <div className="icon-wrapper">
                                    <FaCalendarCheck className="card-icon" />
                                </div>
                                <div>
                                    <h3>Pending Appointments</h3>
                                    <p>{pendingAppointments.length}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Second Row (Middle) */}
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
                            <h3>Upcoming Patients</h3>
                            <div className="appointment-list">
                                <div className="appointment-header">
                                    <span>Patient</span>
                                    <span>Name / Service</span>
                                    <span>Time</span>
                                </div>
                                <ul>
                                    {nextPatients.map((patient, index) => (
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
                                                <strong>{patient.pet_id?.name}</strong>
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
                            {newPatients.length > 0 ? (
                                <div className="next-patient-wrapper">
                                    <div className="next-patient-header">
                                        <div className="patient-image">
                                            <img src={
                                                newPatients[0].pet_id?.avatar && newPatients[0].pet_id?.avatar.startsWith("http")
                                                    ? newPatients[0].pet_id?.avatar
                                                    : newPatients[0].pet_id?.avatar
                                                    ? `http://localhost:5000${newPatients[0].pet_id?.avatar}`
                                                    : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                            } alt={newPatients[0].pet_id?.name} />
                                        </div>
                                        <div className="patient-basic">
                                            <strong>{newPatients[0].pet_id?.name}</strong>
                                            <p>{newPatients[0].service_id.name}</p>
                                        </div>
                                    </div>

                                    <div className="next-patient-details">
                                        <div><span>Owner Name:</span><p>{newPatients[0].ownerName}</p></div>
                                        <div><span>Sex:</span><p>{newPatients[0].pet_id?.gender || 'N/A'}</p></div>
                                        <div><span>Age:</span><p>{newPatients[0].pet_id?.age || 'Unknown'}</p></div>
                                        <div><span>Breed:</span><p>{newPatients[0].pet_id?.breed || 'Unknown'}</p></div>
                                        <div><span>Type:</span><p>{newPatients[0].pet_id?.type || 'Unknown'}</p></div>
                                    </div>
                                </ div>
                            ) : (
                                <p>No upcoming patients.</p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    export default VetSchedules;