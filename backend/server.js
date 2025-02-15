import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import OwnerRoutes from "./route/ownerRoutes.js";
import ClinicRoutes from "./route/clinicRoutes.js";
import VeterinarianRoutes from "./route/VeterinarianRoutes.js"
import ServiceRoutes from "./route/serviceRoutes.js"
import PetRoutes from "./route/petRoutes.js"
import AppointmentRoutes from "./route/appointmentRoutes.js"

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", OwnerRoutes);
app.use("/api", ClinicRoutes);
app.use("/api", PetRoutes);
app.use("/api", VeterinarianRoutes);
app.use("/api", ServiceRoutes);
app.use("/api", AppointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
