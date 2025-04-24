import mongoose from "mongoose";  // Import mongoose
import Pet from "../model/Pet.js";
import Owner from '../model/Owner.js';

export const registerPet = async (req, res) => {
  const { name, type, breed, age, gender, owner_id } = req.body;
  let avatar = null;

  // Check if a file was uploaded
  if (req.file) {
    avatar = `/pet_avatars/${req.file.filename}`; // Set avatar URL
  }

  // Simple validation for owner_id
  if (!owner_id || !mongoose.Types.ObjectId.isValid(owner_id)) {
    return res.status(400).json({ message: "Invalid or missing owner ID" });
  }

  try {
    // Check if the owner exists in the database
    const owner = await Owner.findById(owner_id);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Proceed to create the pet if owner exists
    const newPet = new Pet({
      name,
      type,
      breed,
      age,
      gender,
      owner_id,  // Store the owner_id in the pet document
      avatar,
    });

    const savedPet = await newPet.save();
    res.status(201).json(savedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pets (if needed)
export const getPets = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a pet by ID
export const getPetByID = async (req, res) => {
  const { id } = req.params; // Extract the pet ID from the request parameters

  try {
      const pet = await Pet.findById(id); // Find the pet by ID

      if (!pet) {
          return res.status(404).json({ message: "Pet not found" }); // Return 404 if pet not found
      }

      res.json(pet); // Return the pet details
  } catch (error) {
      res.status(500).json({ message: error.message }); // Handle any errors
  }
};

// Get pets by owner_id
export const getPetsByOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const pets = await Pet.find({ owner_id: ownerId });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pets", error });
  }
};


export const deletePet = async (req, res) => {
  const { petId } = req.params; // Get petId from URL parameters

  // Validate the petId
  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ message: "Invalid or missing pet ID" });
  }

  try {
    // Check if the pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Delete the pet
    await Pet.findByIdAndDelete(petId);
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePet = async (req, res) => {
  const { petId } = req.params; // Get petId from URL parameters
  const updates = req.body; // Get the updates from the request body

  // Validate the petId
  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ message: "Invalid or missing pet ID" });
  }

  try {
    // Check if the pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Update the pet with the new data
    const updatedPet = await Pet.findByIdAndUpdate(petId, updates, { new: true });
    res.status(200).json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPetAvatar = async (req, res) => {
  const { id } = req.params;

  try {
      const pet = await Pet.findById(id);
      if (!pet) {
          return res.status(404).json({ success: false, message: "Pet not found" });
      }

      // Check if file was uploaded
      if (!req.file) {
          return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      // Construct the full URL or relative path for the uploaded avatar
      const avatarUrl = `/pet_avatars/${req.file.filename}`;
      pet.avatar = avatarUrl;

      // Save to database
      await pet.save();

      res.status(200).json({
          success: true,
          message: "Pet avatar uploaded successfully",
          avatarUrl: pet.avatar,
      });
  } catch (error) {
      console.error("Error uploading pet avatar:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};