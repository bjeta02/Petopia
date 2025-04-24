import express from "express";
const router = express.Router();
import { getPets, getPetByID, getPetsByOwner, registerPet, deletePet, updatePet, uploadPetAvatar } from '../controller/petController.js';
import { petAvatarUpload } from "../middleware/petAvatarUpload.js";

router.get('/pets', getPets);
router.get('/pets/details/:id', getPetByID);
router.get('/pets/:ownerId', getPetsByOwner)
router.post('/pets/register', petAvatarUpload.single("avatar"), registerPet);
router.put('/pets/update/:petId', updatePet);
router.delete('/pets/delete/:petId', deletePet);
router.post('/pets/upload-pet-avatar/:id', petAvatarUpload.single("avatar"), uploadPetAvatar);

export default router;