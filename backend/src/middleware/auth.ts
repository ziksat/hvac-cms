import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/helpers";
import prisma from "../utils/prisma";
import { Role } from "@prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: "Invalid or inactive user" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    next();
  };
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  if (err.name === "UnauthorizedError") {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
};
