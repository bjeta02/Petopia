import express from 'express';
import { registerOwner, getOwners, getOwnerById, loginOwner } from '../controller/ownerController.js'; // Ensure the path is correct

const router = express.Router();

// Route to register a new owner
router.post('/owners/register', registerOwner);

// Route to get all owners
router.get('/owners', getOwners);

// Route to get an owner by ID
router.get('/owners/:id', getOwnerById);

// Route to log in an owner
router.post('/owners/login', loginOwner);

export default router;