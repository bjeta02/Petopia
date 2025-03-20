import express from "express";
const router = express.Router();
import { getPets, getPetByID, getPetsByOwner, registerPet, deletePet, updatePet } from '../controller/petController.js';

router.get('/pets', getPets);
router.get('/pets/details/:id', getPetByID);
router.get('/pets/:ownerId', getPetsByOwner)
router.post('/pets/register', registerPet);
router.put('/pets/update/:petId', updatePet);
router.delete('/pets/delete/:petId', deletePet);

export default router;