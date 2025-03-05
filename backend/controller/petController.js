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