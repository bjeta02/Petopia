import express from "express";
import { getVeterinarians } from "../controller/VeterinarianController.js";

const router = express.Router();

router.get("/veterinarians", getVeterinarians);

export default router;
