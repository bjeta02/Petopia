import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js"; // Import Service model

// Serve static logos from the 'logos' folder
export const getClinics = async (req, res) => {
    try {
        const { search, location, service } = req.query;

        let clinicFilters = {};

        // Search for clinics by name or description
        if (search) {
            clinicFilters.$or = [
                { name: { $regex: search, $options: "i" } },  // Case-insensitive search for name
                { description: { $regex: search, $options: "i" } }  // Case-insensitive search for description
            ];
        }

        // Filter by location (address)
        if (location) {
            clinicFilters.address = { $regex: location, $options: "i" }; // Case-insensitive address filter
        }

        // Fetch clinics that match the filters
        const clinics = await Clinic.find(clinicFilters).lean();

        // Fetch services for each clinic and filter by service type if provided
        const clinicsWithServices = await Promise.all(
            clinics.map(async (clinic) => {
                const services = await Service.find({ clinic_id: clinic._id })
                    .limit(3)  // Limit to 3 services
                    .select("name");

                // Filter clinics by selected service
                if (service && !services.some((s) => s.name.toLowerCase() === service.toLowerCase())) {
                    return null;  // If service doesn't match, skip this clinic
                }


                return {
                    ...clinic,
                    services: services.map((s) => s.name),  // Include service name
                };
            })
        );

        // Filter out null clinics (those that didn't match the service filter)
        const filteredClinics = clinicsWithServices.filter((clinic) => clinic !== null);

        // Get distinct addresses and services for frontend use
        const addresses = await Clinic.distinct("address"); // Get distinct clinic addresses
        const services = await Service.distinct("name"); // Get distinct service names

        // Send filtered clinics, addresses, and services to frontend
        res.json({ clinics: filteredClinics, locations: addresses, services });
    } catch (error) {
        console.error("Error fetching clinics with services:", error);
        res.status(500).json({ message: "Failed to retrieve clinics and services." });
    }
};

export const getClinicById = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from request URL

        // Find clinic by ID
        const clinic = await Clinic.findById(id).lean(); 

        // Check if clinic exists
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        // Fetch services for this clinic along with their IDs
        const services = await Service.find({ clinic_id: id }).select("name _id");

        // Construct the response object
        const response = {
            ...clinic,
            services: services.map((s) => ({
                service_id: s._id, // Include the service ID
                service_name: s.name // Include the service name
            })),
        };

        // Send the response
        res.json(response);
    } catch (error) {
        console.error("Error fetching clinic:", error);
        res.status(500).json({ message: "Failed to retrieve clinic." });
    }
};

export const registerClinic = async (req, res) => {
    try {
        // Access clinic data directly (not an array)
        const clinicData = req.body;

        if (!clinicData || Object.keys(clinicData).length === 0) {
            return res.status(400).json({ message: "Invalid input: Clinic data is required." });
        }

        // Handle logo upload
        const logoPath = req.file ? `/logos/${req.file.filename}` : null;

        // Create and save the clinic
        const newClinic = new Clinic({ ...req.body, logo: logoPath });
        const savedClinic = await newClinic.save();

        res.status(201).json({ 
            message: "Clinic registered successfully", 
            data: savedClinic 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateClinic = async (req, res) => {
    try {
        const { clinicId } = req.params; // Get clinicId from request parameters
        const { name, address, contact_number, description, status, open_time, close_time, days, image, logo } = req.body; // Expecting the updated fields from the request body

        // Create an object with the fields to update
        const updateData = {
            name,
            address,
            contact_number,
            description,
            status,
            open_time,
            close_time,
            days,
            image,
            logo
        };

        // Find the clinic and update it with the new data
        const updatedClinic = await Clinic.findByIdAndUpdate(
            clinicId,
            updateData, // Update with the new data
            { new: true, runValidators: true } // Return the updated clinic object and run validators
        );

        // Check if the clinic was found and updated
        if (!updatedClinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        res.status(200).json(updatedClinic); // Return the updated clinic
    } catch (error) {
        console.error("Error updating clinic:", error);
        res.status(500).json({ message: "Failed to update clinic." });
    }
};

export const deleteClinic = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from request URL

        // Check if the clinic exists
        const clinic = await Clinic.findById(id);
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        // Optionally, delete associated services
        await Service.deleteMany({ clinic_id: id });

        // Delete the clinic
        await Clinic.findByIdAndDelete(id);

        // Send a success response
        res.status(200).json({ message: "Clinic deleted successfully." });
    } catch (error) {
        console.error("Error deleting clinic:", error);
        res.status(500).json({ message: "Failed to delete clinic." });
    }
};  