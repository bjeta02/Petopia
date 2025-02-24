import express from "express";
import { registerOwner, registerClinic, loginUser  } from "../controller/userController.js"; // Adjust the path as necessary

const router = express.Router();

// Route for pet owner registration
router.post("/users/register-owner", registerOwner );

// Route for clinic registration
router.post("/users/register-clinic", registerClinic );

// Route for user login
router.post("/users/login", loginUser );

export default router;