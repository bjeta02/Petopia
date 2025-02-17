import express from "express";
import { getAppointments, createAppointment } from "../controller/appointmentController.js";
const router = express.Router();

router.get("/appointments", getAppointments);
router.post("/appointments/create", createAppointment);

export default router;
