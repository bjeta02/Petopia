import express from "express";
import { getAppointments, createAppointment, sendAppointmentOTP,  updateAppointment, deleteAppointment } from "../controller/appointmentController.js";

const router = express.Router();

router.get("/appointments", getAppointments);
router.post("/appointments/create", createAppointment);
router.put("/appointments/update/:id", updateAppointment);
router.delete("/appointments/delete/:id", deleteAppointment);
// Send OTP to owner's email
router.post("/appointments/verify-otp", sendAppointmentOTP);


export default router;