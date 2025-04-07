import express from "express";
import { 
    getAppointments, 
    getAppointmentById,  // ✅ Keep only one instance
    getAppointmentsByOwner, 
    getAppointmentsByClinic, 
    getOwnersWithAppointmentsInClinic, 
    bookAppointment, 
    bookAppointmentForClinic, 
    verifyAppointmentOTP,  
    updateAppointment, 
    deleteAppointment 
} from "../controller/appointmentController.js";

const router = express.Router();

router.get("/appointments", getAppointments);
router.get("/appointments/qr/:id", getAppointmentById);
router.get("/appointments/:ownerId", getAppointmentsByOwner);
router.get("/appointments/clinics/:clinicId", getAppointmentsByClinic);
router.get("/appointments/owners/:clinicId", getOwnersWithAppointmentsInClinic);
router.post("/appointments/book", bookAppointment);
router.post("/appointments/clinic-book", bookAppointmentForClinic);
router.put("/appointments/update/:id", updateAppointment);
router.delete("/appointments/delete/:id", deleteAppointment);
// Send OTP to owner's email
router.post("/appointments/verify-otp", verifyAppointmentOTP);

export default router;
