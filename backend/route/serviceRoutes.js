import express from "express";
import { getServices, getServicesByClinic, postService, updateService } from "../controller/serviceController.js";

const router = express.Router();

router.get("/services", getServices);
router.post("/services/add", postService)
router.get("/services/clinic/:clinicId", getServicesByClinic);
router.put("/services/update/:serviceId", updateService );

export default router;