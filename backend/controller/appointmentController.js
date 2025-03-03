import Appointment from "../model/Appointment.js";
import Guest from '../model/Guest.js';
import Owner from "../model/Owner.js";
import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js";
import Pet from "../model/Pet.js";
import { sendAppointmentEmail, sendOTPEmail, sendAppointmentStatusUpdateEmail } from "../utils/emailService.js";
import crypto from "crypto";

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("owner_id", "firstname lastname email")
            .populate("guest_id", "firstName lastName email phone pets")
            .populate("pet_id", "name type breed")
            .populate("clinic_id", "name")
            .populate("vet_id", "name")
            .populate("service_id", "name")
            .sort({ date: -1 });

        // Create a unified owner name field and include pet details
        const appointmentsWithDetails = appointments.map(appointment => {
            // Check if owner_id or guest_id is present
            const ownerName = appointment.owner_id
                ? `${appointment.owner_id.firstname} ${appointment.owner_id.lastname}`
                : appointment.guest_id
                ? `${appointment.guest_id.firstName} ${appointment.guest_id.lastName}`
                : 'Unknown Owner'; // Fallback if neither is present

            const petDetails = appointment.guest_id && appointment.guest_id.pets && appointment.guest_id.pets.length > 0
                ? appointment.guest_id.pets.map(pet => `${pet.name} (${pet.type})`).join(', ')
                : appointment.pet_id ? `${appointment.pet_id.name} (${appointment.pet_id.type})` : 'No Pet';

            return {
                ...appointment.toObject(),
                ownerName,
                petDetails
            };
        });

        res.status(200).json(appointmentsWithDetails);
    } catch (error) {
        console.error("Error fetching appointments:", error); // Log the error
        res.status(500).json({ message: "Server error", error: error.message }); // Send error message
    }
};

// Temporary storage for unsaved appointments
const pendingAppointments = new Map();

export const bookAppointment = async (req, res) => {
    try {
        const { owner_id, firstName, lastName, petName, petType, petBreed, service_id, clinic_id, date, vet_id, notes, email, phone } = req.body;

        // Check if it's a guest appointment
        if (!owner_id) {
            // Validate required fields for guest owners
            if (!firstName || !lastName || !petName || !petType || !email) {
                return res.status(400).json({ message: "All fields are required for guest owners." });
            }

            // Check if the guest already exists
            const existingGuest = await Guest.findOne({ email });
            if (existingGuest) {
                return res.status(400).json({ message: "A guest account with this email already exists. Please verify your OTP." });
            }

            // Generate OTP and set expiration for guest owners
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

            // Save appointment data in pendingAppointments
            pendingAppointments.set(email, {
                firstName,
                lastName,
                email,
                phone,
                pet: { name: petName, type: petType, breed: petBreed }, // Store pet information
                clinic_id,
                date,
                service_id,
                vet_id,
                notes,
                otp,
                otpExpires,
            });

            // Send the OTP to the guest's email
            await sendOTPEmail(email, otp);

            return res.status(200).json({ message: "OTP sent to your email. Please verify to complete your booking." });
        } else {
            // If it's a registered owner, validate required fields
            if (!service_id || !clinic_id ) {
                return res.status(400).json({ message: "Missing required fields for registered owners." });
            }

            // Check if the pet already exists for the owner
            const existingPet = await Pet.findOne({ owner_id, name: petName });
            let petId;

            if (existingPet) {
                // If the pet exists, use the existing pet ID
                petId = existingPet._id;
            } else {
                // Create a new pet record if it doesn't exist
                const newPet = new Pet({
                    owner_id,
                    name: petName,
                    type: petType,
                    breed: petBreed,
                });
                const savedPet = await newPet.save();
                petId = savedPet._id; // Get the new pet ID
            }

            // Create a new appointment for the registered owner
            const newAppointment = new Appointment({
                owner_id,
                clinic_id,
                date,
                service_id,
                notes,
                pet_id: petId,
                isVerified: true,
            });

            const savedAppointment = await newAppointment.save();

            // Fetch clinic and service details
            const clinic = await Clinic.findById(savedAppointment.clinic_id);
            const service = await Service.findById(savedAppointment.service_id);
            const pet = await Pet.findById(savedAppointment.pet_id);

            // Send confirmation email to the registered owner
            const owner = await Owner.findById(owner_id);
            await sendAppointmentEmail(owner.email, {
                appointmentId: savedAppointment._id,
                clinicName: clinic ? clinic.name : "Your Clinic Name", // Fetch from the database if needed
                clinicAddress: clinic ? clinic.address : "Your Address", // Fetch from the database if needed
                date: new Date(date).toLocaleString(),
                serviceName: service ? service.name : "Your Service Name", // Fetch from the database if needed
                petName: pet ? pet.name : "Your Pet", // Fetch from the database if needed
                petType: pet ? pet.type : "Your Pet Type",
                notes: notes || "No additional notes provided.",
                firstName: owner ? owner.firstname : "Valued Customer"
            });

            return res.status(201).json({ message: "Appointment booked successfully.", appointment: savedAppointment });
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

export const verifyAppointmentOTP = async (req, res) => {
    try {
        const { email: requestEmail, otp } = req.body;

        const pendingAppointment = pendingAppointments.get(requestEmail);

        if (!pendingAppointment) {
            return res.status(400).json({ message: "No pending appointment found. Please request a new OTP." });
        }

        if (pendingAppointment.otp !== otp || pendingAppointment.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // Clear OTP
        pendingAppointment.otp = null;
        pendingAppointment.otpExpires = null;

        // Create a new guest record
        const newGuest = new Guest({
            firstName: pendingAppointment.firstName,
            lastName: pendingAppointment.lastName,
            email: requestEmail,
            phone: pendingAppointment.phone,
            pets: [pendingAppointment.pet], // Store the pet information
        });

        // Create a new appointment linked to the guest
        const newAppointment = new Appointment({
            clinic_id: pendingAppointment.clinic_id,
            date: pendingAppointment.date,
            guest_id: newGuest._id, // Link to the guest
            pet_id: newGuest.pets[0]._id, // Assuming you want to link the first pet
            service_id: pendingAppointment.service_id,
            notes: pendingAppointment.notes,
            isVerified: true, // Mark as verified
        });
        const savedAppointment = await newAppointment.save();

        // Update the guest's appointments array
        newGuest.appointments.push(savedAppointment._id);
        await newGuest.save();

        // Fetch clinic and service details
        const clinic = await Clinic.findById(pendingAppointment.clinic_id);
        const service = await Service.findById(pendingAppointment.service_id);

        // Send confirmation email with all appointment details
        await sendAppointmentEmail(requestEmail, {
            appointmentId: savedAppointment._id, // Appointment ID
            clinicName: clinic ? clinic.name : null, // Clinic name
            clinicAddress: clinic ? clinic.address : null, // Clinic address
            date: new Date(pendingAppointment.date).toLocaleString(), // Format the date
            serviceName: service ? service.name : null, // Service name
            petName: pendingAppointment.pet.name,
            notes: pendingAppointment.notes || "No additional notes provided.", // Any notes provided
            firstName: pendingAppointment.firstName || "Guest", // Pass the first name here
        });

        // Remove pending appointment after success
        pendingAppointments.delete(requestEmail);

        return res.status(201).json({ message: "Appointment booked successfully.", appointment: savedAppointment });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};


export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { clinic_id, date, owner_id, guest_id, pet_id, service_id, vet_id, notes, status } = req.body;

        if (!clinic_id || !date || !service_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updateData = { clinic_id, date, service_id, vet_id, notes, status };

        // Assign owner_id or guest_id
        if (owner_id) {
            updateData.owner_id = owner_id;
        } else if (guest_id) {
            updateData.guest_id = guest_id;
        }

        // Handle pet assignment
        if (owner_id && pet_id) {
            updateData.pet_id = pet_id;
        } else if (guest_id) {
            // Fetch guest details to get pet data
            const guest = await Guest.findById(guest_id);
            if (guest && guest.pets.length > 0) {
                updateData.pet_id = guest.pets[0]._id; // Assign first pet from guest
            }
        }

        // Set timestamps based on status
        if (status === "completed") {
            updateData.completedAt = new Date();
            updateData.rejectedAt = null;
            updateData.confirmedAt = null;
        } else if (status === "cancelled") {
            updateData.rejectedAt = new Date();
            updateData.completedAt = null;
            updateData.confirmedAt = null;
        } else if (status === "confirmed") {
            updateData.confirmedAt = new Date();
            updateData.completedAt = null;
            updateData.rejectedAt = null;
        } else {
            updateData.completedAt = null;
            updateData.rejectedAt = null;
            updateData.confirmedAt = null;
        }


        // Update the appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true })
            .populate("owner_id", "email firstname")
            .populate("guest_id", "email firstName pets")
            .populate("clinic_id", "name")
            .populate("service_id", "name")
            .populate("pet_id", "name");

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        console.log("Updated Appointment:", updatedAppointment);

        // Prepare email details
        let emailDetails;
        let recipientEmail;

        if (updatedAppointment.owner_id) {
            emailDetails = {
                clinicName: updatedAppointment.clinic_id?.name || "Unknown Clinic",
                date: new Date(date).toLocaleString(),
                serviceName: updatedAppointment.service_id?.name || "Unknown Service",
                petName: updatedAppointment.pet_id?.name || "Your Pet",
                firstName: updatedAppointment.owner_id.firstname || "Valued Customer",
                appointmentId: updatedAppointment._id,
                clinicAddress: updatedAppointment.clinic_id?.address || "Unknown Address",
                notes: notes,
            };
            recipientEmail = updatedAppointment.owner_id.email;
        } else if (updatedAppointment.guest_id) {
            console.log("Guest ID:", updatedAppointment.guest_id);
            console.log("Guest Email:", updatedAppointment.guest_id?.email);

            emailDetails = {
                clinicName: updatedAppointment.clinic_id?.name || "Unknown Clinic",
                date: new Date(date).toLocaleString(),
                serviceName: updatedAppointment.service_id?.name || "Unknown Service",
                petName: updatedAppointment.pet_id?.name || updatedAppointment.guest_id?.pets[0]?.name || "Your Pet",
                firstName: updatedAppointment.guest_id?.firstName || "Valued Guest",
                appointmentId: updatedAppointment._id,
                clinicAddress: updatedAppointment.clinic_id?.address || "Unknown Address",
                notes: notes,
            };
            recipientEmail = updatedAppointment.guest_id?.email;
        }

        if (recipientEmail) {
            try {
                console.log(`Sending email to: ${recipientEmail} for status: ${status}`);

                if (status === "confirmed") {
                    await sendAppointmentStatusUpdateEmail(recipientEmail, emailDetails, "confirmed");
                } else if (status === "completed") {
                    await sendAppointmentStatusUpdateEmail(recipientEmail, emailDetails, "completed");
                } else if (status === "cancelled") {
                    await sendAppointmentStatusUpdateEmail(recipientEmail, emailDetails, "cancelled");
                }

                console.log("Email sent successfully to:", recipientEmail);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }
        } else {
            console.warn("No recipient email found, skipping email sending.");
        }

        res.status(200).json({
            message: "Appointment updated successfully.",
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ message: "Server error", error });
    }
};