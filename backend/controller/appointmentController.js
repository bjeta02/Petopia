import Appointment from "../model/Appointment.js";

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("owner_id", "name")
            .populate("pet_id", "name type breed")
            .populate("clinic_id", "name")
            .populate("vet_id", "name")
            .populate("service_id", "name")
            .sort({ date: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
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

// PUT: Update an existing appointment
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params; // Get the appointment ID from the request parameters
        const { clinic_id, date, owner_id, pet_id, service_id, vet_id, notes, status } = req.body;

        // Validate required fields
        if (!clinic_id || !date || !owner_id || !pet_id || !service_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Prepare the update data
        const updateData = { clinic_id, date, owner_id, pet_id, service_id, vet_id, notes, status };

        // Set timestamps based on status
        if (status === "completed") {
            updateData.completedAt = new Date(); // Set current date and time
            updateData.rejectedAt = null; // Clear rejected timestamp
        } else if (status === "cancelled") {
            updateData.rejectedAt = new Date(); // Set current date and time
            updateData.completedAt = null; // Clear completed timestamp
        } else {
            updateData.completedAt = null; // Clear completed timestamp if not completed
            updateData.rejectedAt = null; // Clear rejected timestamp if not rejected
        }

        // Find the appointment by ID and update it
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json(updatedAppointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// DELETE: Delete an appointment
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params; // Get the appointment ID from the request parameters

        // Find the appointment by ID and delete it
        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(204).send(); // Respond with no content
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ message: "Server error", error });
    }
};