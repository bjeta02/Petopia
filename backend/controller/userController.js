import User from "../model/User.js";
import Owner from "../model/Owner.js"; // Assuming you have an Owner model
import Clinic from "../model/Clinic.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

// Register a new owner
export const registerOwner = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // Check if email exists
        const existingUser  = await User.findOne({ email });
        if (existingUser ) return res.status(400).json({ message: "Email already in use" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser  = new User({ firstname, lastname, email, password: hashedPassword, role: "pet_owner" });
        const savedUser  = await newUser .save();

        // Create Owner record
        const newOwner = new Owner({ user_id: savedUser ._id });
        await newOwner.save();

        res.status(201).json({ message: "Owner registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register a new clinic
export const registerClinic = async (req, res) => {
    try {
        const { email, password, clinicName, contactNumber, description } = req.body;

        // Check if email exists
        const existingUser  = await User.findOne({ email });
        if (existingUser ) return res.status(400).json({ message: "Email already in use" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser  = new User({ email, password: hashedPassword, role: "clinic" });
        const savedUser  = await newUser .save();

        // Create Clinic
        const newClinic = new Clinic({
            user_id: savedUser ._id, // Associate the clinic with the user
            name: clinicName,
            address: req.body.address, // Assuming address is passed in the request body
            contact_number: contactNumber,
            description,
            status: "Inactive" // Default status
        });

        const savedClinic = await newClinic.save();

        // Update the user with the clinic ID
        savedUser.clinic_id = savedClinic._id;
        await savedUser.save();

        res.status(201).json({ message: "Clinic registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email and role
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Fetch clinic details if user role is clinic
        let clinic = null;
        if (user.role === "clinic") {
            clinic = await Clinic.findOne({ user_id: user._id });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Return user data and token
        res.status(200).json({
            id: user._id,
            role: user.role,
            clinic_id: clinic?._id || null,
            clinic_name: clinic?.name || null,
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};