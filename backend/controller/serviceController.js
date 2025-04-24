import Service from "../model/Service.js";
import Clinic from "../model/Clinic.js";

// Fetch all services
export const getServices = async (req, res) => {
    try {
        const services = await Service.find().populate("clinic_id", "name address"); // Populate clinic details
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch all services for a specific clinic
export const getServicesByClinic = async (req, res) => {
    const { clinicId } = req.params;  // Clinic ID passed as a parameter
    try {
        const services = await Service.find({ "clinic_id": clinicId })
            .populate("clinic_id", "name address");  // Populate clinic details
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

    export const postService = async (req, res) => {
        try {
            const services = req.body; // Expecting an array of service objects

            if (!Array.isArray(services) || services.length === 0) {
                return res.status(400).json({ message: "Invalid input: Expecting an array of services." });
            }

            // Validate clinic_id for each service
            for (let service of services) {
                if (!service.clinic_id || !service.name) {
                    return res.status(400).json({ message: "Clinic ID and service name are required." });
                }

                // Check if clinic exists
                const clinicExists = await Clinic.findById(service.clinic_id);
                if (!clinicExists) {
                    return res.status(404).json({ message: `Clinic with ID ${service.clinic_id} not found.` });
                }
            }

            // Insert all valid services
            const savedServices = await Service.insertMany(services);
            res.status(201).json({ message: "Services added successfully", data: savedServices });
        } catch (error) {
            console.error("Error posting services:", error);
            res.status(500).json({ message: error.message });
        }
    };

// Update a specific service by ID
export const updateService = async (req, res) => {
    const { serviceId } = req.params;
    const updates = req.body;

    try {
        // Check if the service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found." });
        }

        // Optional: validate fields here if needed
        const updatedService = await Service.findByIdAndUpdate(serviceId, updates, { new: true });

        res.json({ message: "Service updated successfully.", data: updatedService });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ message: error.message });
    }
};
