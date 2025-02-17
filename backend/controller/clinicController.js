import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js"; // Import Service model

export const getClinics = async (req, res) => {
    try {
        const { search, location, service } = req.query;

        let clinicFilters = {};
        if (search) {
            clinicFilters.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (location) {
            clinicFilters.address = { $regex: location, $options: "i" }; // Filter by address (location)
        }

        const clinics = await Clinic.find(clinicFilters).lean();

        // Fetch services for each clinic (limit to 3)
        const clinicsWithServices = await Promise.all(
            clinics.map(async (clinic) => {
                const services = await Service.find({ clinic_id: clinic._id })
                                             .limit(3)
                                             .select("name");

                if (service && services.every((s) => s.name !== service)) {
                    return null;
                }

                return {
                    ...clinic,
                    services: services.map((s) => s.name)
                };
            })
        );

        // Filter out null clinics (those that do not match the service filter)
        const filteredClinics = clinicsWithServices.filter((clinic) => clinic !== null);

        // Get distinct addresses and services for the frontend
        const addresses = await Clinic.distinct("address"); // Use address instead of location
        const services = await Service.distinct("name");

        res.json({ clinics: filteredClinics, locations: addresses, services });
    } catch (error) {
        console.error("Error fetching clinics with services:", error);
        res.status(500).json({ message: "Failed to retrieve clinics and services." });
    }
};

export const getClinicById = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from request URL
        const clinic = await Clinic.findById(id).lean(); // Find clinic by ID

        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        // Fetch services for this clinic along with their IDs
        const services = await Service.find({ clinic_id: id }).select("name _id");

        res.json({ 
            ...clinic, 
            services: services.map((s) => ({
                service_id: s._id, // Include the service ID
                service_name: s.name // Include the service name
            }))
        });
    } catch (error) {
        console.error("Error fetching clinic:", error);
        res.status(500).json({ message: "Failed to retrieve clinic." });
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

