import { Router } from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  sendInvoice,
  recordPayment,
  deleteInvoice,
  getOverdueInvoices,
} from "../controllers/invoiceController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Invoice routes
router.post("/", authorize("ADMIN", "DISPATCHER"), createInvoice);
router.get("/", authorize("ADMIN", "DISPATCHER"), getAllInvoices);
router.get("/overdue", authorize("ADMIN", "DISPATCHER"), getOverdueInvoices);
router.get("/:id", authorize("ADMIN", "DISPATCHER", "CUSTOMER"), getInvoiceById);
router.put("/:id", authorize("ADMIN", "DISPATCHER"), updateInvoice);
router.post("/:id/send", authorize("ADMIN", "DISPATCHER"), sendInvoice);
router.post("/:id/payment", authorize("ADMIN", "DISPATCHER"), recordPayment);
router.delete("/:id", authorize("ADMIN"), deleteInvoice);

export default router;
