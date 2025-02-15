import Owner from "../model/Owner.js";

export const registerOwner = async (req, res) => {
    try {
        const owner = new Owner(req.body);
        await owner.save();
        res.status(201).json(owner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
