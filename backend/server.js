import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import OwnerRoutes from "./route/ownerRoutes.js";
import ClinicRoutes from "./route/clinicRoutes.js";
import ServiceRoutes from "./route/serviceRoutes.js";
import PetRoutes from "./route/petRoutes.js";
import AppointmentRoutes from "./route/appointmentRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve uploaded logos
app.use("/logos", express.static(path.join(__dirname, "logos")));

// Routes
app.use("/api", OwnerRoutes);
app.use("/api", ClinicRoutes);
app.use("/api", PetRoutes);
app.use("/api", ServiceRoutes);
app.use("/api", AppointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
