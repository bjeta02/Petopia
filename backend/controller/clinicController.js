import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js"; // Import Service model

export const getClinics = async (req, res) => {
    try {
        const clinics = await Clinic.find().lean(); // Convert Mongoose objects to plain JS objects

        // Fetch services for each clinic (limited to 3)
        const clinicsWithServices = await Promise.all(
            clinics.map(async (clinic) => {
                const services = await Service.find({ clinic_id: clinic._id })
                                             .limit(3) // LIMIT SERVICES TO 3
                                             .select("name");

                return { 
                    ...clinic, 
                    services: services.map((s) => s.name) // Only return service names
                };
            })
        );

        res.json(clinicsWithServices);
    } catch (error) {
        console.error("Error fetching clinics with services:", error);
        res.status(500).json({ message: "Failed to retrieve clinics and services." });
    }
};


export const registerClinic = async (req, res) => {
    try {
        const clinics = req.body; // Expecting an array of clinic objects
    
        if (!Array.isArray(clinics) || clinics.length === 0) {
          return res.status(400).json({ message: "Invalid input: Expecting an array of clinics." });
        }
    
        const savedClinics = await Clinic.insertMany(clinics);
        res.status(201).json({ message: "Clinics added successfully", data: savedClinics });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

