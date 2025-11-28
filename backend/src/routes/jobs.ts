import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  assignTechnician,
  updateJobStatus,
  addJobPhotos,
  getJobsForScheduling,
} from "../controllers/jobController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Job routes
router.post("/", authorize("ADMIN", "DISPATCHER"), createJob);
router.get("/", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), getAllJobs);
router.get("/scheduling", authorize("ADMIN", "DISPATCHER"), getJobsForScheduling);
router.get("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN", "CUSTOMER"), getJobById);
router.put("/:id", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), updateJob);
router.delete("/:id", authorize("ADMIN"), deleteJob);
router.post("/:id/assign", authorize("ADMIN", "DISPATCHER"), assignTechnician);
router.patch("/:id/status", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), updateJobStatus);
router.post("/:id/photos", authorize("ADMIN", "DISPATCHER", "TECHNICIAN"), addJobPhotos);

export default router;
