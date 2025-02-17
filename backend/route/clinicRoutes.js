import express from "express";
import { getClinics, getClinicById, registerClinic } from "../controller/clinicController.js";

const router = express.Router();

router.get("/clinics", getClinics);
router.get("/clinics/:id", getClinicById);
router.post("/clinics/register", registerClinic);

export default router;
