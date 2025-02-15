import express from "express";
import { registerOwner } from "../controller/ownerController.js";

const router = express.Router();

router.post("/owners/register", registerOwner);

export default router;
