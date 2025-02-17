import Appointment from "../model/Appointment.js";

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST: Create a new appointment
export const createAppointment = async (req, res) => {
    try {
        const { clinic_id, date, owner_id, pet_id, service_id, vet_id, notes } = req.body;

        // Validate required fields
        if (!clinic_id || !date || !owner_id || !pet_id || !service_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create a new appointment
        const newAppointment = new Appointment({
            clinic_id,
            date,
            owner_id,
            pet_id,
            service_id,
            vet_id,
            notes,
        });

        // Save the new appointment to the database
        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);  // Respond with the saved appointment
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
