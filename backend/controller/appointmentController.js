import Appointment from "../model/Appointment.js";

export const getAppointments = async (req, res) => {
    try {
        const Appointments = await Appointment.find();
        res.json(Appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
