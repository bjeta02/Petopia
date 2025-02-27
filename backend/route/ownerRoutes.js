import express from 'express';
import { registerOwner, getOwners, getOwnerById, verifyOwnerOTP, loginOwner, updateOwner, createGuestOwner } from '../controller/ownerController.js'; // Ensure the path is correct

const router = express.Router();

// Route to register a new owner
router.post('/owners/register', registerOwner);

// Route to book a appointment 
router.post('/owners/create', createGuestOwner)

//Route for OTP 
router.post('/owners/verify-otp', verifyOwnerOTP);

// Route to get all owners
router.get('/owners', getOwners);

// Route to get an owner by ID
router.get('/owners/:id', getOwnerById);

// Route to log in an owner
router.post('/owners/login', loginOwner);

//Route to update owner's information
router.put('/owners/update/:id', updateOwner)

export default router;