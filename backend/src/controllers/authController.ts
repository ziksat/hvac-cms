import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { hashPassword, comparePassword, generateToken } from "../utils/helpers";
import { CreateUserDto, LoginDto } from "../types";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role }: CreateUserDto = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, error: "Email already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || "CUSTOMER",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "DISPATCHER" | "TECHNICIAN" | "CUSTOMER",
    });

    res.status(201).json({
      success: true,
      data: { user, token },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDto = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, error: "Account is deactivated" });
      return;
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "DISPATCHER" | "TECHNICIAN" | "CUSTOMER",
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        customer: true,
        technician: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, error: "Failed to get profile" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    res.json({ success: true, data: user, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ success: false, error: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, error: "Failed to change password" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = role ? { role: role as Role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, error: "Failed to get users" });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: user, message: "User status updated" });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, error: "Failed to update user status" });
  }
};
