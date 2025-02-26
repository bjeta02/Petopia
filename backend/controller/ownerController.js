  import Owner from "../model/Owner.js";
  import bcrypt from "bcrypt"; // Assuming you are using bcrypt for password hashing
  import jwt from "jsonwebtoken"; // Assuming you are using JWT for authentication

  // Get all owners
  export const getOwners = async (req, res) => {
      try {
          const owners = await Owner.find(); // Fetch all owners from the database
          res.status(200).json(owners);
      } catch (error) {
          console.error("Error fetching owners:", error);
          res.status(500).json({ message: error.message });
      }
  };

  // Get owner by ID
  export const getOwnerById = async (req, res) => {
      const { id } = req.params; // Get the ID from the request parameters

      try {
          const owner = await Owner.findById(id); // Find the owner by ID
          if (!owner) {
              return res.status(404).json({ message: "Owner not found" });
          }
          res.status(200).json(owner);
      } catch (error) {
          console.error("Error fetching owner by ID:", error);
          res.status(500).json({ message: error.message });
      }
  };

  export const loginOwner = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    try {

        const owner = await Owner.findOne({ email }); // Find the owner by email
        if (!owner) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
          token, 
          owner: { 
              id: owner._id, 
              firstname: owner.firstname, 
              lastname: owner.lastname, 
              email: owner.email 
          } 
        });
    } catch (error) {
        console.error("Error logging in owner:", error);
        res.status(500).json({ message: error.message });
    }
  };

  export const registerOwner = async (req, res) => {
    const { firstname, lastname, email, phone, password } = req.body;
    console.log("Owner data received:", req.body);  // Log the data
    
    // Validate required fields
    if (!firstname || !lastname || !password || !email || !phone) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
    }

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new owner with the provided data
        const newOwner = new Owner({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword // Store the hashed password
        });

        // Save the new owner to the database
        const savedOwner = await newOwner.save();
        res.status(201).json(savedOwner);
    } catch (error) {
        console.error("Error saving owner:", error);
        res.status(500).json({ message: error.message });
    }
  };

  // Update owner by ID
export const updateOwner = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters
  const { firstname, lastname, email, phone, password } = req.body; // Get the updated data from the request body

  try {
      // Find the owner by ID
      const owner = await Owner.findById(id);
      if (!owner) {
          return res.status(404).json({ message: "Owner not found" });
      }

      // Update the owner's information
      if (firstname) owner.firstname = firstname;
      if (lastname) owner.lastname = lastname;
      if (email) owner.email = email;
      if (phone) owner.phone = phone;
      if (password) {
          // Hash the new password before saving
          owner.password = await bcrypt.hash(password, 10);
      }

      // Save the updated owner to the database
      const updatedOwner = await owner.save();
      res.status(200).json(updatedOwner);
  } catch (error) {
      console.error("Error updating owner:", error);
      res.status(500).json({ message: error.message });
  }
};
