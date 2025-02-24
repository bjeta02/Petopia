import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js"; // Import Service model
import path from "path";

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

                // Determine logo file extension (could be jpg, png, etc.)
                const logoExtension = clinic.image.split('.').pop(); // Get the extension from image path
                const logoPath = `/logos/logo_${clinic._id}.${logoExtension}`; // Assuming logos are named like 'logo_clinicId.extension'

                return {
                    ...clinic,
                    services: services.map((s) => s.name),  // Include service names
                    logo: logoPath // Include the logo URL in the response
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
        const clinic = await Clinic.findById(id).lean(); // Find clinic by ID

        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        // Fetch services for this clinic along with their IDs
        const services = await Service.find({ clinic_id: id }).select("name _id");

        const logoPath = `/logos/logo_${clinic._id}.jpg`; // Assuming logos are named like 'logo_clinicId.extension'

        res.json({
            ...clinic,
            services: services.map((s) => ({    
                service_id: s._id, // Include the service ID
                service_name: s.name // Include the service name
            })),
            logo: logoPath // Include the logo URL in the response
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

// Update a clinic's logo
export const updateClinic = async (req, res) => {
    try {
        const { clinicId } = req.params; // Get clinicId from request parameters
        const { status, image } = req.body; // Expecting the new logo image URL/path from the request body

        // Find the clinic and update its logo (image field)
        const updatedClinic = await Clinic.findByIdAndUpdate(
            clinicId,
            { status, image }, // Update the image field with new logo
            { new: true } // Return the updated clinic object
        );
        
        if (!updatedClinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        res.status(200).json(updatedClinic); // Return the updated clinic
    } catch (error) {
        console.error("Error updating clinic logo:", error);
        res.status(500).json({ message: "Failed to update clinic logo." });
    }
};

export const deleteClinicLogo = async (req, res) => {
    try {
      const { clinicId } = req.params;
  
      // Ensure clinicId is provided
      if (!clinicId) {
        return res.status(400).json({ message: "Clinic ID is required" });
      }
  
      // Use MongoDB's $unset operator to remove the logo field
      const updatedClinic = await Clinic.findByIdAndUpdate(
        clinicId,
        { $unset: { logo: 1 } }, // Remove the logo field
        { new: true }
      );
  
      if (!updatedClinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
  
      // Respond with the updated clinic document
      res.status(200).json(updatedClinic); // Return clinic without the logo
    } catch (error) {
      console.error("Error deleting clinic logo:", error);
      res.status(500).json({ message: "Failed to delete clinic logo" });
    }
  };
  
  
