import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js"; // Import Service model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';

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
                    .limit(20)  // Limit to 3 services
                    .select("name description estimated_duration rate"); // Select additional fields

                // Filter clinics by selected service
                if (service && !services.some((s) =>
                    s.name.trim().toLowerCase().includes(service.trim().toLowerCase())
                )) {
                    return null;
                }

                return {
                    ...clinic,
                    services: services.map((s) => ({
                        _id: s._id,
                        name: s.name,
                        description: s.description,
                        estimated_duration: s.estimated_duration,
                        rate: s.rate
                    })),  // Include detailed service information
                };
            })
        );

        // Filter out null clinics (those that didn't match the service filter)
        const filteredClinics = clinicsWithServices.filter((clinic) => clinic !== null);

        // Get distinct addresses and services for frontend use
        const addresses = await Clinic.distinct("address"); // Get distinct clinic addresses
        const serviceNames = await Service.distinct("name"); // Get distinct service names

        // Send filtered clinics, addresses, and services to frontend
        res.json({ clinics: filteredClinics, locations: addresses, services: serviceNames });
    } catch (error) {
        console.error("Error fetching clinics with services:", error);
        res.status(500).json({ message: "Failed to retrieve clinics and services." });
    }
};

export const getClinicById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid clinic ID." });
        }

        const clinic = await Clinic.findById(id).lean();

        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        const services = await Service.find({ clinic_id: id });

        const response = {
            ...clinic,
            services: services.map((s) => ({
                _id: s._id,
                name: s.name,
                description: s.description,
                estimated_duration: s.estimated_duration,
                rate: s.rate,
            })),
            logo: clinic.logo,
        };
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

        // Validate clinicId
        if (!clinicId || !mongoose.Types.ObjectId.isValid(clinicId)) {
            return res.status(400).json({ message: "Invalid clinic ID." });
        }

        const { name, address, email, contact_number, description, status, open_time, close_time, days } = req.body; // Expecting the updated fields from the request body

        // Check if a new logo was uploaded
        const logoPath = req.file ? `/logos/${req.file.filename}` : undefined; // Only update if there's a new file

        // Create an object with the fields to update
        const updateData = {
            name,
            address,
            email,
            contact_number,
            description,
            status,
            open_time,
            close_time,
            days,
        };

        // Only add logo to updateData if a new file is uploaded
        if (logoPath) updateData.logo = logoPath;

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

export const updateClinicLogo = async (req, res) => {
    try {
      const { clinicId } = req.params; // Get clinicId from request parameters
  
      // Validate clinicId
      if (!clinicId || !mongoose.Types.ObjectId.isValid(clinicId)) {
        return res.status(400).json({ success: false, message: "Invalid clinic ID." });
      }
  
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        return res.status(404).json({ success: false, message: "Clinic not found" });
      }
  
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
  
      // Construct the full URL for the uploaded logo
      const logoUrl = `/logos/${req.file.filename}`;
      clinic.logo = logoUrl; // Update the logo field
  
      // Save to database
      await clinic.save();
  
      res.status(200).json({
        success: true,
        message: "Logo uploaded successfully",
        logoUrl: clinic.logo,
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
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

