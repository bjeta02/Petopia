import Owner from "../model/Owner.js";

// Example for owner controller
export const registerOwner = async (req, res) => {
    const { name, email, phone, address } = req.body;
    console.log("Owner data received:", req.body);  // Log the data
    
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
  
    try {
      const newOwner = new Owner({ name, email, phone, address });
      const savedOwner = await newOwner.save();
      res.status(201).json(savedOwner);
    } catch (error) {
      console.error("Error saving owner:", error);
      res.status(500).json({ message: error.message });
    }
  };
  

// Get all owners (if needed)
export const getOwners = async (req, res) => {
    try {
        const owners = await Owner.find();
        res.json(owners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
