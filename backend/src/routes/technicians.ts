import { Router } from "express";
import {
  createTechnician,
  getAllTechnicians,
  getTechnicianById,
  updateTechnician,
  updateLocation,
  getLocationHistory,
  getTechnicianSchedule,
  getAvailableTechnicians,
} from "../controllers/technicianController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Technician routes
router.post("/", authorize("ADMIN"), createTechnician);
router.get("/", authorize("ADMIN", "DISPATCHER"), getAllTechnicians);
router.get("/available", authorize("ADMIN", "DISPATCHER"), getAvailableTechnicians);
router.get("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getTechnicianById);
router.put("/:id", authorize("ADMIN", "TECHNICIAN"), updateTechnician);
router.post("/:id/location", authorize("ADMIN", "TECHNICIAN"), updateLocation);
router.get("/:id/locations", authorize("ADMIN", "DISPATCHER"), getLocationHistory);
router.get("/:id/schedule", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getTechnicianSchedule);

export default router;
