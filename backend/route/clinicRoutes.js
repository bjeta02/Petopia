import express from "express";
import { getClinics, getClinicById, registerClinic, updateClinic, deleteClinic, updateClinicLogo } from "../controller/clinicController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/clinics", getClinics);
router.get("/clinics/:id", getClinicById);
router.post("/clinics/register", upload.single("logo"), registerClinic); // Upload a single file with the field name 'logo'
router.put("/clinics/update/:clinicId", upload.single("logo"), updateClinic); // For updating the logo
router.post("/clinics/upload-logo/:clinicId", upload.single("logo"), updateClinicLogo);
router.delete('/clinics/delete/:id', deleteClinic);// DELETE request to delete a clinic by ID

export default router;