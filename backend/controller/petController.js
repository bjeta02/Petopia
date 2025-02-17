import mongoose from "mongoose";  // Import mongoose
import Pet from "../model/Pet.js";
import Owner from '../model/Owner.js';

export const registerPet = async (req, res) => {
  const { name, type, breed, age, gender, owner_id } = req.body;

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
