import Owner from "../model/Owner.js";
import bcrypt from "bcrypt";

/**
 * Get all owners.
 */
export const getOwners = async (req, res) => {
    try {
        const owners = await Owner.find();
        res.status(200).json(owners);
    } catch (error) {
        console.error("Error fetching owners:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get owner by ID.
 */
/**
 * Get owner by ID.
 */
export const getOwnerById = async (req, res) => {
    const { id } = req.params;

    try {
        // Validate if ID is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid owner ID format" });
        }

        // Find owner and populate associated user details
        const owner = await Owner.findById(id)
            .populate({
                path: "userId",
                select: "firstname lastname email role", // Select only necessary fields
            });

        if (!owner) {
            return res.status(404).json({ message: "Owner not found" });
        }

        res.status(200).json({ success: true, data: owner });
    } catch (error) {
        console.error("Error fetching owner by ID:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


/**
 * Create guest owner (for appointment booking only).
 */
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

/**
 * Update owner by ID.
 */
export const updateOwner = async (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters
    const { firstname, lastname, email, phone, address, password } = req.body;

    try {
        const owner = await Owner.findById(id); // Find the owner by ID
        if (!owner) return res.status(404).json({ message: "Owner not found" });

        // Update fields if they exist
        if (firstname) owner.firstname = firstname;
        if (lastname) owner.lastname = lastname;
        if (email) owner.email = email;
        if (phone) owner.phone = phone;
        if (address) owner.address = address;
        if (password) owner.password = await bcrypt.hash(password, 10);

        const updatedOwner = await owner.save(); // Save the updated owner
        res.status(200).json(updatedOwner);
    } catch (error) {
        console.error("Error updating owner:", error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadOwnerAvatar = async (req, res) => {
    const { id } = req.params;

    try {
        const owner = await Owner.findById(id);
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Construct the full URL for the uploaded avatar
        const avatarUrl = `/avatars/${req.file.filename}`;
        owner.avatar = avatarUrl;

        // Save to database
        await owner.save();

        res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            avatarUrl: owner.avatar,
        });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

