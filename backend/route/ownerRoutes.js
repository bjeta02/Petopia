import express from "express";
import { registerOwner, getOwners } from "../controller/ownerController.js";

const router = express.Router();

router.post("/owners/register", registerOwner);
router.get("/owners", getOwners);

export default router;
