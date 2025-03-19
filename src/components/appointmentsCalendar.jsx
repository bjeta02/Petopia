import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { format } from "date-fns";
import "./css/calendar.css";

const AppointmentsCalendar = ({ appointments }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [visible, setVisible] = useState(false);

    const handleDateChange = (e) => {
        setSelectedDate(e.value);
        console.log("Selected date:", e.value);
        setVisible(true);
    };

    const filteredAppointments = selectedDate
        ? appointments.filter(
            (appointment) =>
                format(new Date(appointment.date), "yyyy-MM-dd") ===
                format(new Date(selectedDate), "yyyy-MM-dd")
        )
        : [];

        console.log("filtered bitoy: ", filteredAppointments);

    const getAppointmentStyle = (status) => {
        const styles = {
            completed: { backgroundColor: "green", color: "white" },
            pending: { backgroundColor: "yellow", color: "black" },
            confirmed: { backgroundColor: "blue", color: "white" },
            cancelled: { backgroundColor: "red", color: "white" },
        };
        return styles[status] || { backgroundColor: "gray", color: "white" }; // Default style
    };
    console.log("filtered bitoy 1: ", filteredAppointments);

    const getAppointmentCount = (date) => {
        return appointments.filter(
            (appointment) =>
                format(new Date(appointment.date), "yyyy-MM-dd") ===
                format(new Date(date), "yyyy-MM-dd")
        ).length;
    };

    console.log("filtered bitoy 2: ", filteredAppointments);

    return (
        <div>
            <Calendar
                dateFormat="mm/dd/yy"
                onChange={handleDateChange}
                inline
                monthNavigator
                yearNavigator
                dayTemplate={(date) => {
                    const count = getAppointmentCount(date);
                    return (
                        <div>
                            <span>{date.getDate()}</span>
                            {count > 0 && <span className="appointment-count">{count}</span>}
                        </div>
                    );
                }}
            />

            <Dialog
                header="Appointments"
                visible={visible}
                style={{ width: "400px" }}
                onHide={() => setVisible(false)}
            >
                {filteredAppointments.length > 0 ? (
                    <div className="appointment-list">
                        {filteredAppointments.map((appointment) => (
                            <div
                                key={appointment._id}
                                style={getAppointmentStyle(appointment.status)}
                                className="appointment-item"
                            >
                                <p><strong>Pet:</strong> {appointment.pet_id.name}</p>
                                <p><strong>Reason:</strong> {appointment.notes}</p>
                                <p><strong>Vet:</strong> {appointment.vet_id.name}</p>
                                <p><strong>Date:</strong> {format(new Date(appointment.date), 'MMMM dd, yyyy')}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No appointments for this date.</p>
                )}
            </Dialog>
        </div>
    );
};

export default AppointmentsCalendar;