import express from "express";
import { getAppointments, bookAppointment, verifyAppointmentOTP,  updateAppointment, deleteAppointment } from "../controller/appointmentController.js";

const router = express.Router();

router.get("/appointments", getAppointments);
router.post("/appointments/book", bookAppointment);
router.put("/appointments/update/:id", updateAppointment);
router.delete("/appointments/delete/:id", deleteAppointment);
// Send OTP to owner's email
router.post("/appointments/verify-otp", verifyAppointmentOTP);

export default router;
