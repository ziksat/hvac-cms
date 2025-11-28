import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
} from "../controllers/authController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

// Admin only routes
router.get("/users", authenticate, authorize("ADMIN"), getAllUsers);
router.patch("/users/:id/status", authenticate, authorize("ADMIN"), updateUserStatus);

export default router;
