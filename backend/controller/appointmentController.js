import Appointment from "../model/Appointment.js";
import Owner from "../model/Owner.js";
import Clinic from "../model/Clinic.js";
import Service from "../model/Service.js";
import Pet from "../model/Pet.js";
import { sendAppointmentEmail, sendOTPEmail } from "../utils/emailService.js";
import crypto from "crypto";

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("owner_id", "name email")
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

// Temporary storage for unsaved appointments
const pendingAppointments = new Map();

// Send OTP for appointment
export const createAppointment = async (req, res) => {
    try {
        const { owner_id, clinic_id, date, pet_id, service_id, vet_id, notes } = req.body;

        // Fetch the owner by ID
        const owner = await Owner.findById(owner_id);

        if (!owner || !owner.email) {
            return res.status(404).json({ message: "Owner not found. Please register first." });
        }

        // Generate OTP and set expiration
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Save appointment data in pendingAppointments
        pendingAppointments.set(owner.email, {
            owner_id: owner._id,
            clinic_id,
            date,
            pet_id,
            service_id,
            vet_id,
            notes,
            otp,
            otpExpires,
        });

        // Send the OTP to the owner's email
        await sendOTPEmail(owner.email, otp);

        res.status(200).json({ message: "OTP sent to your email. Please verify to confirm the appointment." });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


// Verify OTP and create the appointment
export const sendAppointmentOTP = async (req, res) => {
    try {
        const { owner_id, otp } = req.body;

        // Find the owner to get the email
        const owner = await Owner.findById(owner_id);

        if (!owner || !owner.email) {
            return res.status(404).json({ message: "Owner not found. Please register first." });
        }

        const pendingAppointment = pendingAppointments.get(owner.email);

        if (!pendingAppointment) {
            return res.status(400).json({ message: "No pending appointment found. Please request a new OTP." });
        }

        if (pendingAppointment.otp !== otp || pendingAppointment.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // Clear OTP and save the appointment
        pendingAppointment.otp = null;
        pendingAppointment.otpExpires = null;

        const { clinic_id, date, pet_id, service_id, vet_id, notes } = pendingAppointment;

        // Save the appointment
        const newAppointment = new Appointment({ clinic_id, date, owner_id, pet_id, service_id, vet_id, notes });
        const savedAppointment = await newAppointment.save();

        // Fetch related info
        const clinic = await Clinic.findById(clinic_id);
        const service = await Service.findById(service_id);
        const pet = await Pet.findById(pet_id);

        // Send confirmation email
        await sendAppointmentEmail(owner.email, {
            clinicName: clinic?.name || "Unknown Clinic",
            date,
            serviceName: service?.name || "Unknown Service",
            petName: pet?.name || "Your Pet",
        });

        // Remove pending appointment after success
        pendingAppointments.delete(owner.email);

        res.status(201).json({ message: "Appointment created successfully!", appointment: savedAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { clinic_id, date, owner_id, pet_id, service_id, vet_id, notes, status } = req.body;

        if (!clinic_id || !date || !owner_id || !pet_id || !service_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updateData = { clinic_id, date, owner_id, pet_id, service_id, vet_id, notes, status };

        if (status === "completed") {
            updateData.completedAt = new Date();
            updateData.rejectedAt = null;
        } else if (status === "cancelled") {
            updateData.rejectedAt = new Date();
            updateData.completedAt = null;
        } else {
            updateData.completedAt = null;
            updateData.rejectedAt = null;
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true }).populate("owner_id", "email firstname");

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (updatedAppointment.owner_id && updatedAppointment.owner_id.email) {
            await sendAppointmentEmail(updatedAppointment.owner_id.email, {
                clinicName: clinic?.name || "Unknown Clinic",
                date,
                serviceName: service?.name || "Unknown Service",
                petName: pet?.name || "Your Pet",
            });
        }

        res.status(200).json(updatedAppointment);
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