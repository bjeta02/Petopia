import express from 'express';
import { getOwners, getOwnerById, updateOwner, createGuestOwner } from '../controller/ownerController.js';
import { getUsers, registerUser, verifyUserOTP, loginUser } from '../controller/ownerAuthController.js';

const router = express.Router();
// Route to register a new owner
router.get('/users', getUsers);

// Route to register a new owner
router.post('/owners/register', registerUser);

// Route to book a appointment 
router.post('/owners/create', createGuestOwner)

//Route for OTP 
router.post('/owners/verify-otp', verifyUserOTP);

// Route to get all owners
router.get('/owners', getOwners);

// Route to get an owner by ID
router.get('/owners/:id', getOwnerById);

// Route to log in an owner
router.post('/owners/login', loginUser);

//Route to update owner's information
router.put('/owners/update/:id', updateOwner)

export default router;