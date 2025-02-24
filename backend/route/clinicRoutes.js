import express from "express";
import { getClinics, getClinicById, registerClinic, updateClinic, deleteClinicLogo } from "../controller/clinicController.js";

const router = express.Router();

router.get("/clinics", getClinics);
router.get("/clinics/:id", getClinicById);
router.post("/clinics/register", registerClinic);
router.put("/clinics/update/:clinicId", updateClinic); // This route is for updating the logo
router.delete("/clinics/deletelogo/:clinicId", deleteClinicLogo); // New route for deleting the logo

export default router;
