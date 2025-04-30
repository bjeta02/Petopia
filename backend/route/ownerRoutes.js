import express from 'express';
import { getOwners, getOwnerById, updateOwner, uploadOwnerAvatar, createGuestOwner } from '../controller/ownerController.js';
import { getUsers, registerOwnerWithOTP, registerUserWithoutOTP, verifyUserOTP, loginUser, updateUser, deleteUser, verifyResetPasswordOTP, sendPasswordResetOTP, logoutUser } from '../controller/ownerAuthController.js';
import { uploadAvatar } from "../middleware/uploadAvatar.js";


const router = express.Router();
// Route to register a new owner
router.get('/users', getUsers);

// For owner registration with OTP
router.post('/owners/register-with-otp', registerOwnerWithOTP);

// For user registration without OTP (owner, clinic, admin)
router.post('/users/register', registerUserWithoutOTP);

// For deleting a user (Owner, Clinic, Admin)
router.delete('/users/delete', deleteUser);

// Route to book a appointment 
router.post('/owners/create', createGuestOwner);

//Route for OTP 
router.post('/owners/verify-otp', verifyUserOTP);

//Route for Upload-avatar
router.post("/owners/upload-avatar/:id", uploadAvatar.single("avatar"), uploadOwnerAvatar);

// Route to get all owners
router.get('/owners', getOwners);

// Route to get an owner by ID
router.get('/owners/:id', getOwnerById);

// Route to log in an owner
router.post('/owners/login', loginUser);

//Route to update owner's information
router.put('/owners/update/:id', updateOwner)

router.put('/users/update/:id', updateUser);

router.post("/auth/send-reset", sendPasswordResetOTP);

router.post("/auth/verify-reset", verifyResetPasswordOTP);

router.post("/auth/logout", logoutUser);

export default router;