import { Router } from "express";
import {
  createEstimate,
  getAllEstimates,
  getEstimateById,
  updateEstimate,
  sendEstimate,
  approveEstimate,
  rejectEstimate,
  deleteEstimate,
} from "../controllers/estimateController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Estimate routes
router.post("/", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), createEstimate);
router.get("/", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getAllEstimates);
router.get("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN", "CUSTOMER"), getEstimateById);
router.put("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), updateEstimate);
router.post("/:id/send", authorize("ADMIN", "DISPATCHER"), sendEstimate);
router.post("/:id/approve", authorize("ADMIN", "CUSTOMER"), approveEstimate);
router.post("/:id/reject", authorize("ADMIN", "CUSTOMER"), rejectEstimate);
router.delete("/:id", authorize("ADMIN"), deleteEstimate);

export default router;
