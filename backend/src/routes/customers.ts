import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerServiceHistory,
} from "../controllers/customerController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post("/", authorize("ADMIN", "DISPATCHER"), createCustomer);
router.get("/", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getAllCustomers);
router.get("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getCustomerById);
router.put("/:id", authorize("ADMIN", "DISPATCHER"), updateCustomer);
router.delete("/:id", authorize("ADMIN"), deleteCustomer);
router.get("/:id/history", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getCustomerServiceHistory);

export default router;
