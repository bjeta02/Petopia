import express from "express";
import { getServices, postService } from "../controller/serviceController.js";

const router = express.Router();

router.get("/services", getServices);
router.post("/services/add", postService)
export default router;
