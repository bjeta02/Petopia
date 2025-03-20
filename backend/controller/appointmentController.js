import Appointment from "../model/Appointment.js";
import Guest from '../model/Guest.js';
import Owner from "../model/Owner.js";
import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js";
import Pet from "../model/Pet.js";
import { sendAppointmentEmail, sendOTPEmail, sendAppointmentStatusUpdateEmail, sendFollowUpEmailToClinic } from "../utils/emailService.js";
import crypto from "crypto";

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("owner_id", "firstname lastname email")
            .populate("guest_id", "firstName lastName email phone pets")
            .populate("pet_id", "name type breed")
            .populate("clinic_id", "name")
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

export const getAppointmentsByOwner = async (req, res) => {
    const { ownerId } = req.params;

    try {
        const appointments = await Appointment.find({ owner_id: ownerId })
            .populate('owner_id', 'firstname lastname email') // Populate owner details
            .populate('pet_id', 'name type breed') // Populate pet details
            .populate('clinic_id', 'name') // Populate clinic details
            .populate('service_id', 'name'); // Populate service details

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found for this owner." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error); // Log the error in console
        res.status(500).json({ 
            message: "Error fetching appointments", 
            error: error.message // Send detailed error message
        });
    }
};


export const getAppointmentsByClinic = async (req, res) => {
    const { clinicId } = req.params;

    try {
        const appointments = await Appointment.find({ clinic_id: clinicId })
            .populate("owner_id", "firstname lastname email")
            .populate("guest_id", "firstName lastName email phone pets")
            .populate("pet_id", "name type breed")
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
        console.error("Error fetching clinic appointments:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const getOwnersWithAppointmentsInClinic = async (req, res) => {
    const { clinicId } = req.params;
  
    try {
      // Step 1: Get appointments for the clinic that have a valid owner
      const appointments = await Appointment.find({
        clinic_id: clinicId,
        owner_id: { $ne: null },
      })
        .populate("owner_id", "firstname lastname email") // include owner info
        .populate("pet_id") // if your schema links to a Pet model
        .populate("service_id"); // if services are in a Service model
  
      // Step 2: Group by owner
      const ownerMap = new Map();
  
      appointments.forEach((appt) => {
        const owner = appt.owner_id;
        if (!ownerMap.has(owner._id.toString())) {
          ownerMap.set(owner._id.toString(), {
            _id: owner._id,
            firstname: owner.firstname,
            lastname: owner.lastname,
            email: owner.email,
            pets: [],
            services: [],
          });
        }
      
        const ownerData = ownerMap.get(owner._id.toString());
      
        // ✅ Fix: use pet_id instead of pet
        if (
          appt.pet_id &&
          !ownerData.pets.find((p) => p._id.toString() === appt.pet_id._id.toString())
        ) {
          ownerData.pets.push(appt.pet_id);
        }
      
        // Add services
        const services = Array.isArray(appt.service_id) ? appt.service_id : [appt.service_id];
        services.forEach((service) => {
          if (
            service &&
            !ownerData.services.find((s) => s._id.toString() === service._id.toString())
          ) {
            ownerData.services.push(service);
          }
        });
      });      
  
      // Step 3: Return combined data
      const ownersWithDetails = Array.from(ownerMap.values());
  
      res.status(200).json(ownersWithDetails);
    } catch (error) {
      console.error("Error fetching owners with pets and services:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  


// Temporary storage for unsaved appointments
const pendingAppointments = new Map();

export const bookAppointment = async (req, res) => {
    try {
        const { owner_id, firstName, lastName, petName, petType, petBreed, petGender, petAge, service_id, clinic_id, date, vet_id, notes, email, phone } = req.body;

        if (!owner_id) {
            // 🟢 Guest Booking
            if (!firstName || !lastName || !petName || !petType || !email) {
                return res.status(400).json({ message: "All fields are required for guest owners." });
            }

            // Check if the guest already exists
            const existingGuest = await Guest.findOne({ email });
            if (existingGuest) {
                return res.status(400).json({ message: "A guest account with this email already exists. Please verify your OTP." });
            }

            // Generate OTP & Save Pending Appointment
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

            pendingAppointments.set(email, {
                firstName, lastName, email, phone,
                pet: { name: petName, type: petType, breed: petBreed, gender: petGender, age: petAge },
                clinic_id, date: new Date(date), service_id, vet_id, notes, otp, otpExpires
            });

            // Send OTP
            await sendOTPEmail(email, otp);
            return res.status(200).json({ message: "OTP sent to your email. Please verify to complete your booking." });
        }

        // 🟢 Registered Owner Booking
        if (!service_id || !clinic_id) {
            return res.status(400).json({ message: "Missing required fields for registered owners." });
        }

        const existingPet = await Pet.findOne({ 
            owner_id, 
            name: { $regex: new RegExp(`^${petName}$`, "i") }, // Case-insensitive
            type: petType
        });
        
        let petId;
        
        if (existingPet) {
            petId = existingPet._id; // ✅ Use existing pet's ID
            console.log("✅ Existing pet found, using petId:", petId);
        } else {
            const newPet = new Pet({
                owner_id,
                name: petName,
                type: petType,
                breed: petBreed,
                gender: petGender,
                age: petAge
            });
            const savedPet = await newPet.save();
            petId = savedPet._id; // ✅ Use newly created pet's ID
            console.log("🆕 New pet created, petId:", petId);
        }

        // ✅ Create Appointment
        const passedDate = new Date(date);
        const now = new Date();
        passedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);

        const newAppointment = new Appointment({ owner_id, clinic_id, date: passedDate, service_id, notes, pet_id: petId, isVerified: true });
        const savedAppointment = await newAppointment.save();

        // ✅ Fetch Additional Details
        const [clinic, service, pet, owner] = await Promise.all([
            Clinic.findById(savedAppointment.clinic_id),
            Service.findById(savedAppointment.service_id),
            Pet.findById(savedAppointment.pet_id),
            Owner.findById(owner_id)
        ]);

        // ✅ Send Confirmation Email
        await sendAppointmentEmail(owner.email, {
            appointmentId: savedAppointment._id,
            clinicName: clinic?.name || "Your Clinic Name",
            clinicAddress: clinic?.address || "Your Address",
            date: date.toLocaleString(),
            serviceName: service?.name || "Your Service Name",
            petName: pet?.name || "Your Pet",
            petType: pet?.type || "Your Pet Type",
            notes: notes || "No additional notes provided.",
            firstName: owner?.firstname || "Valued Customer"
        });

        return res.status(201).json({ message: "Appointment booked successfully.", appointment: savedAppointment });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};


export const bookAppointmentForClinic = async (req, res) => {
    try {
        const { owner_id, pet_id, clinic_id, service_id, date, vet_id, notes } = req.body;

        // Validate required fields
        if (!owner_id || !pet_id || !clinic_id || !service_id || !date) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const rawDate = new Date(date);
            const now = new Date();

            rawDate.setHours(now.getHours());
            rawDate.setMinutes(now.getMinutes());
            rawDate.setSeconds(now.getSeconds());
            rawDate.setMilliseconds(0);

        // Create a new appointment for the owner
        const newAppointment = new Appointment({
            owner_id,
            pet_id,
            clinic_id,
            service_id,
            date: rawDate,
            vet_id,
            notes,
            isVerified: true, // Mark as verified
        });

        const savedAppointment = await newAppointment.save();

        // Fetch clinic and service details
        const clinic = await Clinic.findById(savedAppointment.clinic_id);
        const service = await Service.findById(savedAppointment.service_id);
        const pet = await Pet.findById(savedAppointment.pet_id);
        const owner = await Owner.findById(owner_id);

        // Send follow-up checkup email notification
        const followUpDate = new Date(savedAppointment.date);
        followUpDate.setDate(followUpDate.getDate() + 7); // Set follow-up date to 7 days later
        await sendFollowUpEmailToClinic(clinic.email, {
            appointmentId: savedAppointment._id,
            clinicName: clinic ? clinic.name : "Your Clinic Name",
            firstName: owner ? owner.firstname : "Valued Customer",
            lastName: owner ? owner.lastname : "Unknown",
            petName: pet ? pet.name : "Your Pet",
            serviceName: service ? service.name : "Your Service Name",
            followUpDate: followUpDate.toLocaleString(),
            notes: notes || "No additional notes provided.",
        });

        return res.status(201).json({ message: "Appointment booked successfully.", appointment: savedAppointment });
    } catch (error) {
        console.error("Error booking appointment for clinic:", error);
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
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const normalizedStatus = status.toLowerCase();
        const updateData = { status };

        // Update timestamps and merge current time into the existing appointment date
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Merge current time into existing date
        const updatedDate = new Date(appointment.date);
        const now = new Date();
        updatedDate.setHours(now.getHours());
        updatedDate.setMinutes(now.getMinutes());
        updatedDate.setSeconds(now.getSeconds());
        updatedDate.setMilliseconds(0);

        updateData.date = updatedDate;

        // Set specific status timestamps
        if (normalizedStatus === "completed") {
            updateData.completedAt = new Date();
            updateData.rejectedAt = null;
            updateData.confirmedAt = null;
        } else if (normalizedStatus === "cancelled") {
            updateData.rejectedAt = new Date();
            updateData.completedAt = null;
            updateData.confirmedAt = null;
        } else if (normalizedStatus === "confirmed") {
            updateData.confirmedAt = new Date();
            updateData.completedAt = null;
            updateData.rejectedAt = null;
        } else {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true })
            .populate("owner_id", "email firstname")
            .populate("guest_id", "email firstName pets")
            .populate("clinic_id", "name address")
            .populate("service_id", "name")
            .populate("pet_id", "name");

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Shared adjusted date for email
        const adjustedDate = new Date(updatedAppointment.date);

        // Prepare email content
        let emailDetails;
        let recipientEmail;

        if (updatedAppointment.owner_id) {
            emailDetails = {
                clinicName: updatedAppointment.clinic_id?.name || "Unknown Clinic",
                date: adjustedDate.toLocaleString(),
                serviceName: updatedAppointment.service_id?.name || "Unknown Service",
                petName: updatedAppointment.pet_id?.name || "Your Pet",
                firstName: updatedAppointment.owner_id.firstname || "Valued Customer",
                appointmentId: updatedAppointment._id,
                clinicAddress: updatedAppointment.clinic_id?.address || "Unknown Address",
                notes: updatedAppointment.notes || "No additional notes",
            };
            recipientEmail = updatedAppointment.owner_id.email;
        } else if (updatedAppointment.guest_id) {
            emailDetails = {
                clinicName: updatedAppointment.clinic_id?.name || "Unknown Clinic",
                date: adjustedDate.toLocaleString(),
                serviceName: updatedAppointment.service_id?.name || "Unknown Service",
                petName: updatedAppointment.pet_id?.name || updatedAppointment.guest_id?.pets[0]?.name || "Your Pet",
                firstName: updatedAppointment.guest_id?.firstName || "Valued Guest",
                appointmentId: updatedAppointment._id,
                clinicAddress: updatedAppointment.clinic_id?.address || "Unknown Address",
                notes: updatedAppointment.notes || "No additional notes",
            };
            recipientEmail = updatedAppointment.guest_id?.email;
        }

        // Send email
        if (recipientEmail) {
            try {
                await sendAppointmentStatusUpdateEmail(recipientEmail, emailDetails, status);
                console.log("Email sent successfully to:", recipientEmail);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }
        } else {
            console.warn("No recipient email found, skipping email sending.");
        }

        res.status(200).json({
            message: "Appointment status updated successfully.",
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