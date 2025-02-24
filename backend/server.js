import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Ensure this path is correct
import OwnerRoutes from "./route/ownerRoutes.js";
import ClinicRoutes from "./route/clinicRoutes.js";
import ServiceRoutes from "./route/serviceRoutes.js";
import PetRoutes from "./route/petRoutes.js";
import AppointmentRoutes from "./route/appointmentRoutes.js";
import AuthRoutes from "./route/userRoute.js"; // Fixed typo in the import
import path from "path"; // Import path for static file serving
import { fileURLToPath } from 'url'; // Import for ES Module compatibility
import { dirname } from 'path'; // Import dirname function

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

// Get the directory name for the current file in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // Equivalent to __dirname in CommonJS

// Serve static files (logos)
app.use("/logos", express.static(path.join(__dirname, "logos"))); // Serve the logos folder

// Routes
app.use("/api", OwnerRoutes);
app.use("/api", ClinicRoutes);
app.use("/api", PetRoutes);
app.use("/api", ServiceRoutes);
app.use("/api", AppointmentRoutes);
app.use("/api", AuthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));