import User from "../model/User.js";
import Owner from "../model/Owner.js";
import Clinic from "../model/Clinic.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// passport-setup.js
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { sendOTPEmail } from "../utils/emailService.js";

// Temporary storage for pending user registrations (OTP verification)
const pendingUsers = new Map();

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching owners:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Register a new user (Owner, Clinic, or Admin) without OTP verification.
 */
export const registerUserWithoutOTP = async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body;
    console.log("User registration data received (without OTP):", req.body);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email address." });

    if (!["owner", "clinic", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'owner', 'clinic', or 'admin'." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered. Please log in." });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Directly register Clinics, Admins, and Owners (no OTP for these roles)
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role,
            isVerified: true, // Automatically verify Clinic and Admin roles
        });

        const savedUser = await newUser.save();

        // Create Clinic entry if role is "clinic"
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
    } catch (error) {
        console.error("Error registering user without OTP:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Register an owner with OTP verification.
 */
export const registerOwnerWithOTP = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    console.log("Owner registration with OTP data received:", req.body);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email address." });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered. Please log in." });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP for owner
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires after 5 minutes

        // Store pending user in memory (or use database if persistence is needed)
        pendingUsers.set(email, { firstname, lastname, email, password: hashedPassword, role: "owner", otp, otpExpires });

        // Send OTP email
        await sendOTPEmail(email, otp);

        return res.status(201).json({ message: "OTP sent to your email for verification." });
    } catch (error) {
        console.error("Error registering owner with OTP:", error);
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



export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required!" });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid email or password" });

        if (!user.password) {
            console.log("❌ This account is linked to Google. Blocking manual login.");
            return res.status(403).json({ message: "This email is linked to a Google account. Please log in with Google." });
        }

        if (!user.isVerified)
            return res.status(401).json({ message: "Account not verified. Please verify with OTP." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid email or password" });

        // ✅ Set user status to Active
        await User.findByIdAndUpdate(user._id, { status: "Active" });

        // Build userData response object
        let userData = {
            id: user._id.toString(),
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        };

        // Append related ID if applicable
        if (user.role === "owner") {
            const owner = await Owner.findOne({ userId: user._id });
            if (owner) userData.ownerId = owner._id.toString();
        } else if (user.role === "clinic") {
            const clinic = await Clinic.findOne({ userId: user._id });
            if (clinic) userData.clinicId = clinic._id.toString();
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                ownerId: userData.ownerId || null,
                clinicId: userData.clinicId || null
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token, user: userData });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: error.message });
    }
};

export const logoutUser  = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      const user = await User.findById(userId);
      if (!user) {
        console.log('User  not found for ID:', userId);
        return res.status(404).json({ message: 'User  not found' });
      }
  
      user.status = 'Inactive';
      const savedUser  = await user.save();
      console.log('User  status updated:', savedUser );
  
      res.status(200).json({ message: 'User  logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Failed to log out user' });
    }
  };

export const googleLogin = async (req, res) => {
    try {
        if (!req.user) {
            console.error("❌ Google login failed: req.user is undefined");
            return res.status(401).json({ message: "Authentication failed. No user found." });
        }

        console.log("✅ Google login successful. User:", req.user);

        // 🔹 Check if user exists
        let user = await User.findOne({ email: req.user.email });

        if (user) {
            // 🔥 Prevent Google login if user signed up manually
            if (user.password) {
                console.log("❌ This account was registered manually. Blocking Google login.");
                return res.status(403).json({ message: "This email is registered with a password. Please log in with email and password instead." });
            }

        } else {
            // ✅ Create a new Google user if they don’t exist
            user = new User({
                googleId: req.user.googleId,
                email: req.user.email,
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                isVerified: true,
                role: "owner",
            });

            await user.save();
        }

        // ✅ Ensure Owner Profile Exists
        let owner = await Owner.findOne({ userId: user._id });
        if (!owner) {
            console.log("🔹 Owner profile missing. Creating one now...");
            owner = new Owner({
                userId: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            });
            await owner.save();
        }

        console.log("✅ Owner profile found/created:", owner._id);

        // ✅ Generate JWT token with `ownerId`
        const token = jwt.sign(
            { id: user._id, role: user.role, ownerId: owner._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token, user, ownerId: owner._id });
    } catch (error) {
        console.error("❌ Error during Google login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, address, password, status } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (email) user.email = email;
        if (address) user.address = address;
        if (status) user.status = status;
        if (password) user.password = await bcrypt.hash(password, 10);

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Delete a user (Owner, Clinic, or Admin) by email or userId.
 */
export const deleteUser = async (req, res) => {
    const { email, userId } = req.body;

    if (!email && !userId) {
        return res.status(400).json({ message: "Either email or userId is required." });
    }

    try {
        // If email is provided, find the user by email
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (userId) {
            user = await User.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user is associated with a clinic (for clinic role)
        if (user.role === "clinic") {
            await Clinic.deleteOne({ userId: user._id });  // Delete associated clinic data
        }

        // Delete the user
        await User.deleteOne({ _id: user._id });

        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: error.message });
    }
};

export const sendPasswordResetOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required." });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (!user.password) {
            return res.status(403).json({ message: "This email is linked to a Google account. You cannot reset the password here." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        pendingUsers.set(email, {
            otp,
            otpExpires,
            resetPassword: true // Flag for reset flow
        });

        await sendOTPEmail(email, otp);
        return res.status(200).json({ message: "OTP sent to email for password reset." });
    } catch (error) {
        console.error("Error sending password reset OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2. Verify OTP and Reset Password
export const verifyResetPasswordOTP = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    const pending = pendingUsers.get(email);
    if (!pending || pending.otp !== otp || pending.otpExpires < new Date() || !pending.resetPassword) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        pendingUsers.delete(email);
        return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};