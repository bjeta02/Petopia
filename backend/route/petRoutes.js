import express from "express";
const router = express.Router();
import { getPets } from '../controller/petController.js';

router.get('/pets', getPets);

export default router;