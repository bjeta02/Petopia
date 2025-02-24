import express from "express";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from "../controller/appointmentController.js";
const router = express.Router();

router.get("/appointments", getAppointments);
router.post("/appointments/create", createAppointment);
router.put("/appointments/update/:id", updateAppointment);
router.delete("/appointments/delete/:id", deleteAppointment);

export default router;
