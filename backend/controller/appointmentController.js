import Appointment from "../model/Appointment.js";
import Guest from '../model/Guest.js';
import Owner from "../model/Owner.js";
import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js";
import Pet from "../model/Pet.js";
import { sendAppointmentEmail, sendOTPEmail, sendAppointmentStatusUpdateEmail, sendFollowUpEmailToClinic } from "../utils/emailService.js";
import crypto from "crypto";
import { generateQRCode, createPDF } from "../utils/pdfService.js";
import mongoose from "mongoose";


export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("owner_id", "firstname lastname email")
            .populate("guest_id", "firstName lastName email phone pets")
            .populate("pet_id", "name type breed age gender avatar")
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
                petDetails,
                medical_concern: appointment.medical_concern
            };
        });

        res.status(200).json(appointmentsWithDetails);
    } catch (error) {
        console.error("Error fetching appointments:", error); // Log the error
        res.status(500).json({ message: "Server error", error: error.message }); // Send error message
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params; // Extract the appointment ID from the request parameters

        const appointment = await Appointment.findById(id)
            .populate("owner_id", "firstname lastname email")
            .populate("guest_id", "firstName lastName email phone pets")
            .populate("pet_id", "name type breed age gender avatar")
            .populate("clinic_id", "name")
            .populate("service_id", "name");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Format owner name
        const ownerName = appointment.owner_id
            ? `${appointment.owner_id.firstname} ${appointment.owner_id.lastname}`
            : appointment.guest_id
            ? `${appointment.guest_id.firstName} ${appointment.guest_id.lastName}`
            : 'Unknown Owner';

        // Format pet details
        const petDetails = appointment.guest_id?.pets?.length
            ? appointment.guest_id.pets.map(pet => `${pet.name} (${pet.type})`).join(', ')
            : appointment.pet_id
            ? `${appointment.pet_id.name} (${appointment.pet_id.type})`
            : 'No Pet';

        const appointmentWithDetails = {
            ...appointment.toObject(),
            ownerName,
            petDetails,
            petName: petDetails, // if you want petName separately
            owner: ownerName, // if you want owner separately
            medical_concern: appointment.medical_concern
        };

        res.status(200).json(appointmentWithDetails);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAppointmentsByOwner = async (req, res) => {
    const { ownerId } = req.params;

    try {
        const appointments = await Appointment.find({ owner_id: ownerId })
            .populate('owner_id', 'firstname lastname email') // Populate owner details
            .populate("pet_id", "name type breed age gender avatar")
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
            .populate("pet_id", "name type breed age gender avatar")
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

            // Extract pet details
            let petDetails = 'No Pet';
            let petAvatar = null;
            let petAge = null;
            let petGender = null;

            if (appointment.guest_id && appointment.guest_id.pets && appointment.guest_id.pets.length > 0) {
                petDetails = appointment.guest_id.pets.map(pet => `${pet.name} (${pet.type})`).join(', ');
            } else if (appointment.pet_id) {
                petDetails = `${appointment.pet_id.name} (${appointment.pet_id.type})`;
                petAvatar = appointment.pet_id.avatar; // Get pet avatar
                petAge = appointment.pet_id.age; // Get pet age
                petGender = appointment.pet_id.gender; // Get pet gender
            }

            return {
                ...appointment.toObject(),
                ownerName,
                petDetails,
                petAvatar, // Include pet avatar in the response
                petAge,    // Include pet age in the response
                petGender  // Include pet gender in the response
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
  
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
      return res.status(400).json({ message: "Invalid Clinic ID format" });
    }
  
    try {
      const appointments = await Appointment.find({
        clinic_id: new mongoose.Types.ObjectId(clinicId),
        owner_id: { $ne: null }, // Ensure only valid owners
      })
        .populate("owner_id", "firstname lastname email")
        .populate("pet_id", "name type breed age gender avatar")
        .populate("service_id");
  
      if (!appointments.length) {
        return res.status(404).json({ message: "No appointments found for this clinic." });
      }
  
      const ownerMap = new Map();
  
      appointments.forEach((appt) => {
        if (!appt.owner_id) return; // ✅ Ensure owner exists
  
        const owner = appt.owner_id;
        const ownerId = owner._id.toString();
  
        if (!ownerMap.has(ownerId)) {
          ownerMap.set(ownerId, {
            _id: owner._id,
            firstname: owner.firstname,
            lastname: owner.lastname,
            email: owner.email,
            pets: [],
            services: [],
          });
        }
  
        const ownerData = ownerMap.get(ownerId);
  
        if (appt.pet_id && appt.pet_id._id) {
          if (!ownerData.pets.some((p) => p._id.toString() === appt.pet_id._id.toString())) {
            ownerData.pets.push(appt.pet_id);
          }
        }
  
        const services = Array.isArray(appt.service_id) ? appt.service_id : [appt.service_id];
        services.forEach((service) => {
          if (service?._id && !ownerData.services.some((s) => s._id.toString() === service._id.toString())) {
            ownerData.services.push(service);
          }
        });
      });
  
      res.status(200).json(Array.from(ownerMap.values()));
    } catch (error) {
      console.error("❌ Error fetching owners:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };  
  


// Temporary storage for unsaved appointments
const pendingAppointments = new Map();

export const bookAppointment = async (req, res) => {
    try {
        const { owner_id, firstName, lastName, petName, petType, petBreed, petGender, petAge, service_id, clinic_id, date, vet_id, notes, email, phone, medical_concern } = req.body;

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
            sendOTPEmail(email, otp);
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

        const newAppointment = new Appointment({ owner_id, clinic_id, date: passedDate, service_id, notes, pet_id: petId, isVerified: true, medical_concern });
        const savedAppointment = await newAppointment.save();

        // ✅ Fetch Additional Details
        const [clinic, service, pet, owner] = await Promise.all([
            Clinic.findById(savedAppointment.clinic_id),
            Service.findById(savedAppointment.service_id),
            Pet.findById(savedAppointment.pet_id),
            Owner.findById(owner_id)
        ]);

        const verifyUrl = `http://localhost:3000/verify?appointmentId=${savedAppointment._id}`;
        const qrCode = await generateQRCode(verifyUrl);

        // ✅ Generate PDF
        const pdfBuffer = await createPDF({
            appointmentId: savedAppointment._id,
            clinicName: clinic?.name || "Your Clinic Name",
            clinicAddress: clinic?.address || "Your Address",
            date: new Date(passedDate).toLocaleString(),
            serviceName: service?.name || "Your Service Name",
            petName: petName,
            petType: petType,
            notes: notes || "No additional notes provided.",
            firstName: owner?.firstname || "Valued Customer",
            clinicEmail: clinic?.email || "Your Email"
        }, qrCode);

        // ✅ Send Confirmation Email (With PDF Attachment)
        sendAppointmentEmail(owner.email, {
            appointmentId: savedAppointment._id,
            clinicName: clinic?.name || "Your Clinic Name",
            clinicAddress: clinic?.address || "Your Address",
            date: new Date(passedDate).toLocaleString(),
            serviceName: service?.name || "Your Service Name",
            petName: petName,
            petType: petType,
            notes: notes || "No additional notes provided.",
            firstName: owner?.firstname || "Valued Customer",
        },pdfBuffer);

        return res.status(201).json({ message: "Appointment booked successfully.", appointment: savedAppointment });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};


export const bookAppointmentForClinic = async (req, res) => {
    try {
        const { owner_id, pet_id, clinic_id, service_id, date, vet_id, notes } = req.body;

        if (!owner_id || !pet_id || !clinic_id || !service_id || !date) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const rawDate = new Date(date);
        const now = new Date();

        rawDate.setHours(now.getHours());
        rawDate.setMinutes(now.getMinutes());
        rawDate.setSeconds(now.getSeconds());
        rawDate.setMilliseconds(0);

        const newAppointment = new Appointment({
            owner_id,
            pet_id,
            clinic_id,
            service_id,
            date: rawDate,
            vet_id,
            notes,
            isVerified: true, 
            status: "Pending", 
        });

        const savedAppointment = await newAppointment.save();

        // Fetch clinic, service, pet, and owner details
        const clinic = await Clinic.findById(savedAppointment.clinic_id).select('email name');
        const service = await Service.findById(savedAppointment.service_id);
        const pet = await Pet.findById(savedAppointment.pet_id);
        const owner = await Owner.findById(owner_id);

        if (!clinic || !clinic.email) {
            console.error('No clinic email found. Skipping follow-up email.');
        } else {
            // Prepare follow-up date (7 days later)
            const followUpDate = new Date(savedAppointment.date);
            followUpDate.setDate(followUpDate.getDate() + 7);

            // ✅ Create Appointment
            const passedDate = new Date(date);
            const now = new Date();
            passedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);

            const verifyUrl = `http://localhost:3000/verify?appointmentId=${savedAppointment._id}`;
            const qrCode = await generateQRCode(verifyUrl);

            // ✅ Generate PDF
            const pdfBuffer = await createPDF({
                appointmentId: savedAppointment._id,
                clinicName: clinic?.name || "Your Clinic Name",
                clinicAddress: clinic?.address || "Your Address",
                date: new Date(passedDate).toLocaleString(),
                serviceName: service?.name || "Your Service Name",
                petName: pet?.name,
                petType: pet?.type,
                notes: notes || "No additional notes provided.",
                firstName: owner?.firstname || "Valued Customer"
            }, qrCode);

            // Send follow-up email
            sendFollowUpEmailToClinic(clinic.email, {
                appointmentId: savedAppointment._id,
                clinicName: clinic.name || "Your Clinic Name",
                firstName: owner?.firstname || "Valued Customer",
                lastName: owner?.lastname || "Unknown",
                petName: pet?.name || "Your Pet",
                serviceName: service?.name || "Your Service Name",
                followUpDate: followUpDate.toLocaleString(),
                notes: notes || "No additional notes provided.",
            }, pdfBuffer);
        }

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

        const passedDate = new Date(pendingAppointment.date);
        const now = new Date();
        passedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);

        // Create a new appointment linked to the guest
        const newAppointment = new Appointment({
            clinic_id: pendingAppointment.clinic_id,
            date: new Date(passedDate).toLocaleDateString(),
            guest_id: newGuest._id, // Link to the guest
            pet_id: newGuest.pets[0]._id, // Assuming you want to link the first pet
            service_id: pendingAppointment.service_id,
            notes: pendingAppointment.notes,    
            isVerified: true, // Mark as verified
            medical_concern: pendingAppointment.medical_concern
        });
        const savedAppointment = await newAppointment.save();

        // Update the guest's appointments array
        newGuest.appointments.push(savedAppointment._id);
        await newGuest.save();

        // Fetch clinic and service details
        const clinic = await Clinic.findById(pendingAppointment.clinic_id);
        const service = await Service.findById(pendingAppointment.service_id);
        

        // ✅ Generate QR Code
        const verifyUrl = `http://localhost:3000/verify?appointmentId=${savedAppointment._id}`;
        const qrCode = await generateQRCode(verifyUrl);

        // ✅ Generate PDF
        const pdfBuffer = await createPDF({
            appointmentId: savedAppointment._id,
            clinicName: clinic?.name || "Your Clinic Name",
            clinicAddress: clinic?.address || "Your Address",
            date: new Date(passedDate).toLocaleString(),
            serviceName: service?.name || "Your Service Name",
            petName: pendingAppointment.pet.name,  // ✅ From pendingAppointment
            petType: pendingAppointment.pet.type,  // ✅ From pendingAppointment
            notes: pendingAppointment.notes || "No additional notes provided.",  // ✅ From pendingAppointment
            firstName: pendingAppointment.firstName || "Valued Customer"  // ✅ From pendingAppointment
        }, qrCode);
        

        // ✅ Send Confirmation Email (With PDF Attachment)
        sendAppointmentEmail(pendingAppointment.email, {
            appointmentId: savedAppointment._id,
            clinicName: clinic?.name || "Your Clinic Name",
            clinicAddress: clinic?.address || "Your Address",
            date: new Date(passedDate).toLocaleString(),
            serviceName: service?.name || "Your Service Name",
            petName: pendingAppointment.pet.name,
            petType: pendingAppointment.pet.type,
            notes: pendingAppointment.notes || "No additional notes provided.",
            firstName: pendingAppointment.firstName || "Valued Customer",
        }, pdfBuffer);
        
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
        const { status, notes, date, time, price,medical_concern } = req.body;

        const updateData = {};

        // Validate input fields
        if (status) {
            const normalizedStatus = status.toLowerCase();
            updateData.status = status;

            // Set specific status timestamps
            switch (normalizedStatus) {
                case "completed":
                    updateData.completedAt = new Date();
                    updateData.rejectedAt = null;
                    updateData.confirmedAt = null;
                    break;

                case "cancelled":
                    updateData.rejectedAt = new Date();
                    updateData.completedAt = null;
                    updateData.confirmedAt = null;
                    break;

                case "confirmed":
                    updateData.confirmedAt = new Date();
                    updateData.completedAt = null;
                    updateData.rejectedAt = null;
                    break;

                case "in-progress":
                case "ready-for-pickup":
                    // No specific timestamps needed, but included for consistency
                    updateData.confirmedAt = updateData.confirmedAt || new Date();
                    break;

                case "pending":
                    // Reset timestamps for fresh pending status
                    updateData.confirmedAt = null;
                    updateData.completedAt = null;
                    updateData.rejectedAt = null;
                    break;

                default:
                    return res.status(400).json({ message: "Invalid status value" });
            }
        }

        // Update notes if provided
        if (notes) {
            updateData.notes = notes;
        }

        // Update date & time together (single date field)
        if (date) {
            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found" });
            }

            // Convert the new date and merge time if provided
            const updatedDate = new Date(date);
            if (time) {
                const [hours, minutes] = time.split(":").map(Number);
                updatedDate.setHours(hours);
                updatedDate.setMinutes(minutes);
            }

            updateData.date = updatedDate;
        }

        // Update price if provided
        if (price) {
            updateData.price = price;
        }

        // Update medical_concern if provided
        if (medical_concern) {
            updateData.medical_concern = medical_concern;
        }

        // Update the appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true })
            .populate("owner_id", "email firstname")
            .populate("guest_id", "email firstName pets")
            .populate("clinic_id", "email name address")
            .populate("service_id", "name")
            .populate("pet_id", "name");

        console.log("Updated appointment:", updatedAppointment); // Log the updated appointment

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Prepare email content
        let emailDetails;
        let recipientEmail;

        if (updatedAppointment.owner_id) {
            emailDetails = {
                clinicName: updatedAppointment.clinic_id?.name || "Unknown Clinic",
                date: updatedAppointment.date.toLocaleString(), // Single field for date & time
                serviceName: updatedAppointment.service_id?.name || "Unknown Service",
                petName: updatedAppointment.pet_id?.name || "Your Pet",
                firstName: updatedAppointment.owner_id.firstname || "Valued Customer",
                appointmentId: updatedAppointment._id,
                clinicAddress: updatedAppointment.clinic_id?.address || "Unknown Address",
                notes: updatedAppointment.notes || "No additional notes",
                price: updatedAppointment.price ? `₱${updatedAppointment.price}` : "Not specified",
                clinicEmail: updatedAppointment.clinic_id?.email || "No email provided",
            };
            recipientEmail = updatedAppointment.owner_id.email;
        } else if (updatedAppointment.guest_id) {
            emailDetails = {
                clinicName: updatedAppointment.clinic_id?.name || "Unknown Clinic",
                date: updatedAppointment.date.toLocaleString(), // Single field for date & time
                serviceName: updatedAppointment.service_id?.name || "Unknown Service",
                petName: updatedAppointment.pet_id?.name || updatedAppointment.guest_id?.pets[0]?.name || "Your Pet",
                firstName: updatedAppointment.guest_id?.firstName || "Valued Guest",
                appointmentId: updatedAppointment._id,
                clinicAddress: updatedAppointment.clinic_id?.address || "Unknown Address",
                notes: updatedAppointment.notes || "No additional notes",
                price: updatedAppointment.price ? `₱${updatedAppointment.price}` : "Not specified",
                clinicEmail: updatedAppointment.clinic_id?.email || "No email provided",
            };
            recipientEmail = updatedAppointment.guest_id?.email;
        }

        // Generate PDF for completed appointments
        let pdfBuffer = null;
        if (status === "completed") {
            pdfBuffer = await generateAppointmentPDF(updatedAppointment);
        }

        // Send email
        if (recipientEmail) {
            try {
                sendAppointmentStatusUpdateEmail(recipientEmail, emailDetails, status, pdfBuffer);
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