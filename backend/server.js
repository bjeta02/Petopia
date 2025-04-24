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
import session from "express-session";
import passport from "passport";
import { fileURLToPath } from "url";
import { dirname } from "path";
import './utils/passport-setup.js';
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import OwnerModel from "./model/Owner.js"; // ✅ Correct (for ES Modules)

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET, // Change this to a secure key
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve uploaded logos
app.use("/logos", express.static(path.join(__dirname, "logos")));
app.use("/avatars", express.static(path.join(__dirname, "avatars")));
app.use("/pet_avatars", express.static(path.join(__dirname, "pet_avatars")));

// Routes
app.use("/api", OwnerRoutes);
app.use("/api", ClinicRoutes);
app.use("/api", PetRoutes);
app.use("/api", ServiceRoutes);
app.use("/api", AppointmentRoutes);

// Google Auth Routes
app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/google/failure", session: false }),
    async (req, res) => {  // ✅ Use async to allow database fetching
        if (!req.user) {
            console.error("❌ Google authentication failed. No user found.");
            return res.redirect("http://localhost:3000/google-auth-failure?message=Authentication failed");
        }

        console.log("✅ User authenticated via Google:", req.user);

        try {
            // Fetch ownerId from DB if the user is an owner
            let ownerId = null;
            if (req.user.role === "owner") {
                const owner = await OwnerModel.findOne({ userId: req.user._id });
                if (owner) {
                    ownerId = owner._id;
                    req.user.ownerId = owner._id;  // ✅ Attach to req.user
                }
            }

            console.log("✅ Owner authenticated via Google:", ownerId);

            // Generate JWT with role and ownerId
            const token = jwt.sign(
                { id: req.user._id, role: req.user.role, ownerId: ownerId || null },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.redirect(`http://localhost:3000/google-auth-success?token=${encodeURIComponent(token)}`);
        } catch (error) {
            console.error("❌ Error fetching owner ID:", error);
            return res.redirect("http://localhost:3000/google-auth-failure?message=Server error");
        }
    }
);


// New failure route
app.get("/auth/google/failure", (req, res) => {
    res.redirect("http://localhost:3000/login?message=This email was registered manually. Please use email and password.");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));