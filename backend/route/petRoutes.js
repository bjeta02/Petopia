import express from "express";
const router = express.Router();
import { getPets, registerPet } from '../controller/petController.js';

router.get('/pets', getPets);
router.post('/pets/register', registerPet);

export default router;