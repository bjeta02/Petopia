import Owner from "../model/Owner.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendAppointmentEmail, sendOTPEmail } from "../utils/emailService.js";

// Get all owners
export const getOwners = async (req, res) => {
    try {
        const owners = await Owner.find();
        res.status(200).json(owners);
    } catch (error) {
        console.error("Error fetching owners:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get owner by ID
export const getOwnerById = async (req, res) => {
    const { id } = req.params;
    try {
        const owner = await Owner.findById(id);
        if (!owner) return res.status(404).json({ message: "Owner not found" });
        res.status(200).json(owner);
    } catch (error) {
        console.error("Error fetching owner by ID:", error);
        res.status(500).json({ message: error.message });
    }
};

// Temporary storage for unsaved owners (could use Redis or cache for scalability)
const pendingOwners = new Map();

// Register a regular owner with OTP verification
export const registerOwner = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    console.log("Owner registration data received:", req.body);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });

    try {
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) return res.status(400).json({ message: "Email already registered. Please log in." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Store owner data in memory (pending confirmation)
        pendingOwners.set(email, {
            firstname,
            lastname,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false,
            isGuest: false,
        });

        await sendOTPEmail(email, otp);
        res.status(201).json({ message: "OTP sent to your email for verification." });
    } catch (error) {
        console.error("Error registering owner:", error);
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP and save the owner to the database
export const verifyOwnerOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const pendingOwner = pendingOwners.get(email);
        if (!pendingOwner) {
            return res.status(400).json({ message: "No registration found for this email." });
        }

        if (pendingOwner.otp !== otp || pendingOwner.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // Save the owner in the database after successful OTP verification
        const newOwner = new Owner({ ...pendingOwner, isVerified: true, otp: null, otpExpires: null });
        await newOwner.save();
        
        // Remove the pending owner from memory
        pendingOwners.delete(email);

        res.status(200).json({ message: "Account verified and registered successfully!" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: error.message });
    }
};


// Login owner
export const loginOwner = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required!" });

    try {
        const owner = await Owner.findOne({ email });
        if (!owner) return res.status(401).json({ message: "Invalid email or password" });
        if (!owner.isVerified) return res.status(401).json({ message: "Account not verified. Please verify with OTP." });

        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ 
            token, 
            owner: { id: owner._id.toString(), firstname: owner.firstname, lastname: owner.lastname, email: owner.email }
        });
    } catch (error) {
        console.error("Error logging in owner:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create guest owner (for appointment booking only)
export const createGuestOwner = async (req, res) => {
    const { firstname, lastname, email } = req.body;
    try {
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner && existingOwner.isGuest) return res.status(200).json(existingOwner);
        if (existingOwner) return res.status(400).json({ message: "Email already registered. Please log in." });

        const newGuestOwner = new Owner({ firstname, lastname, email, isGuest: true });
        const savedGuestOwner = await newGuestOwner.save();
        res.status(201).json(savedGuestOwner);
    } catch (error) {
        console.error("Error creating guest owner:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update owner by ID
export const updateOwner = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, phone, password } = req.body;
    try {
        const owner = await Owner.findById(id);
        if (!owner) return res.status(404).json({ message: "Owner not found" });

        if (firstname) owner.firstname = firstname;
        if (lastname) owner.lastname = lastname;
        if (email) owner.email = email;
        if (phone) owner.phone = phone;
        if (password) owner.password = await bcrypt.hash(password, 10);

        const updatedOwner = await owner.save();
        res.status(200).json(updatedOwner);
    } catch (error) {
        console.error("Error updating owner:", error);
        res.status(500).json({ message: error.message });
    }
};