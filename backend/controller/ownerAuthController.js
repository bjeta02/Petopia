import User from "../model/User.js";
import Owner from "../model/Owner.js";
import Clinic from "../model/Clinic.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/emailService.js";

// Temporary storage for pending user registrations (OTP verification)
const pendingUsers = new Map();

/**
 * Register a new user (Owner, Clinic, or Admin) with optional OTP verification.
 */
export const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body;
    console.log("User registration data received:", req.body);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email address." });

    if (!["owner", "clinic", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'owner', 'clinic', or 'admin'." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered. Please log in." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const isOwner = role === "owner";

        if (isOwner) {
            // Generate OTP for owners
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

            // Store pending user in memory
            pendingUsers.set(email, { firstname, lastname, email, password: hashedPassword, role, otp, otpExpires });

            await sendOTPEmail(email, otp);
            return res.status(201).json({ message: "OTP sent to your email for verification." });
        } else {
            // Directly register Clinics & Admins (no OTP required)
            const newUser = new User({ firstname, lastname, email, password: hashedPassword, role, isVerified: true });
            const savedUser = await newUser.save();

            // ✅ Create Clinic entry if role is "clinic"
            if (role === "clinic") {
                const newClinic = new Clinic({
                    userId: savedUser._id,  // Associate clinic with the user
                    name: `${firstname} ${lastname}`, // Default name
                    email: savedUser.email,
                    contact_number: "",
                    address: "",
                    status: "Inactive",
                });

                await newClinic.save();
            }

            return res.status(201).json({ message: "User registered successfully!" });
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: error.message });
    }
};


/**
 * Verify OTP for owner registration.
 */
export const verifyUserOTP = async (req, res) => {
    const { email, otp } = req.body;

    console.log("Received OTP verification request for:", email); // Debugging

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    const pendingUser = pendingUsers.get(email);
    if (!pendingUser) {
        return res.status(400).json({ message: "No registration found for this email." });
    }

    if (pendingUser.otp !== otp || pendingUser.otpExpires < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    try {
        // Save verified user in database
        const newUser = new User({ 
            firstname: pendingUser.firstname, 
            lastname: pendingUser.lastname, 
            email: pendingUser.email, 
            password: pendingUser.password, 
            role: pendingUser.role, 
            isVerified: true 
        });

        const savedUser = await newUser.save();

        // Only create Owner entry if the role is "owner"
        if (pendingUser.role === "owner") {
            const newOwner = new Owner({
                userId: savedUser._id,
                firstname: savedUser.firstname,
                lastname: savedUser.lastname,
                email: savedUser.email,
            });

            await newOwner.save();
        }

        // Remove pending user from temporary storage
        pendingUsers.delete(email);

        res.status(200).json({ message: "Account verified and registered successfully!" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



/**
 * Unified login for Admins, Clinics, and Owners.
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    if (!email || !password) return res.status(400).json({ message: "Email and password are required!" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        if (!user.isVerified) return res.status(401).json({ message: "Account not verified. Please verify with OTP." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        let userData = {
            id: user._id.toString(),
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        };

        // Fetch additional data based on role
        if (user.role === "owner") {
            const owner = await Owner.findOne({ userId: user._id });
            if (owner) {
                userData.ownerId = owner._id.toString(); // Add ownerId to userData
                userData.ownerData = owner; // Optionally include other owner data
            }
        } else if (user.role === "clinic") {
            const clinic = await Clinic.findOne({ userId: user._id });
            if (clinic) {
                userData.clinicId = clinic._id.toString(); // Store clinicId
            }
        }

        res.status(200).json({ token, user: userData });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: error.message });
    }
};
