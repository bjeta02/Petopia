import Pet from "../model/Pet.js";

export const getPets = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};