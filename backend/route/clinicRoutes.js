import express from "express";
import { getClinics, registerClinic } from "../controller/clinicController.js";

const router = express.Router();

router.get("/clinics", getClinics);
router.post("/clinics/register", registerClinic);

export default router;
