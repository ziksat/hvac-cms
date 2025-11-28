import { Router } from "express";
import {
  getDashboardStats,
  getRevenueReport,
  getTechnicianPerformance,
  getJobStatusBreakdown,
  getRecentActivity,
} from "../controllers/dashboardController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication and admin/dispatcher access
router.use(authenticate);
router.use(authorize("ADMIN", "DISPATCHER"));

// Dashboard routes
router.get("/stats", getDashboardStats);
router.get("/revenue", getRevenueReport);
router.get("/technician-performance", getTechnicianPerformance);
router.get("/job-status", getJobStatusBreakdown);
router.get("/recent-activity", getRecentActivity);

export default router;
