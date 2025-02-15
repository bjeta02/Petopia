import express from "express";
import { getAppointments } from "../controller/appointmentController.js";
const router = express.Router();

router.get("/appointments", getAppointments);

export default router;
