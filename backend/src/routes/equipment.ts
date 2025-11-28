import { Router } from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentDueForMaintenance,
  getExpiringWarranties,
} from "../controllers/equipmentController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Equipment routes
router.post("/", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), createEquipment);
router.get("/", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getAllEquipment);
router.get("/maintenance-due", authorize("ADMIN", "DISPATCHER"), getEquipmentDueForMaintenance);
router.get("/expiring-warranties", authorize("ADMIN", "DISPATCHER"), getExpiringWarranties);
router.get("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getEquipmentById);
router.put("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), updateEquipment);
router.delete("/:id", authorize("ADMIN"), deleteEquipment);

export default router;
