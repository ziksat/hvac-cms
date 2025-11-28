import { Router } from "express";
import authRoutes from "./auth";
import customerRoutes from "./customers";
import technicianRoutes from "./technicians";
import jobRoutes from "./jobs";
import estimateRoutes from "./estimates";
import invoiceRoutes from "./invoices";
import equipmentRoutes from "./equipment";
import dashboardRoutes from "./dashboard";

const router = Router();

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/technicians", technicianRoutes);
router.use("/jobs", jobRoutes);
router.use("/estimates", estimateRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/dashboard", dashboardRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
