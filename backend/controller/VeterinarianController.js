import Veterinarian from "../model/Veterinarian.js";

export const getVeterinarians = async (req, res) => {
    try {
        const veterinarians = await Veterinarian.find();
        res.json(services);
    } catch {
        res.status(500).json({ message: error.message });
    }
};