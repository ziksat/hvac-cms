import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CreateEquipmentDto } from "../types";

export const createEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateEquipmentDto = req.body;

    const equipment = await prisma.equipment.create({
      data,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: equipment,
      message: "Equipment created successfully",
    });
  } catch (error) {
    console.error("Create equipment error:", error);
    res.status(500).json({ success: false, error: "Failed to create equipment" });
  }
};

export const getAllEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, customerId, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: { customerId?: string; type?: string } = {};
    if (customerId) where.customerId = String(customerId);
    if (type) where.type = String(type);

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          _count: {
            select: { jobs: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.equipment.count({ where }),
    ]);

    res.json({
      success: true,
      data: equipment,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all equipment error:", error);
    res.status(500).json({ success: false, error: "Failed to get equipment" });
  }
};

export const getEquipmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
        jobs: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            technician: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!equipment) {
      res.status(404).json({ success: false, error: "Equipment not found" });
      return;
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error("Get equipment by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to get equipment" });
  }
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, brand, model, serialNumber, installDate, warrantyExpiry, notes } = req.body;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: { name, type, brand, model, serialNumber, installDate, warrantyExpiry, notes },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: equipment, message: "Equipment updated successfully" });
  } catch (error) {
    console.error("Update equipment error:", error);
    res.status(500).json({ success: false, error: "Failed to update equipment" });
  }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.equipment.delete({ where: { id } });

    res.json({ success: true, message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Delete equipment error:", error);
    res.status(500).json({ success: false, error: "Failed to delete equipment" });
  }
};

export const getEquipmentDueForMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get equipment that hasn't had service in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const equipment = await prisma.equipment.findMany({
      where: {
        jobs: {
          none: {
            completedAt: { gte: sixMonthsAgo },
            status: "COMPLETED",
          },
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
        jobs: {
          take: 1,
          orderBy: { completedAt: "desc" },
          where: { status: "COMPLETED" },
        },
      },
    });

    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error("Get equipment due for maintenance error:", error);
    res.status(500).json({ success: false, error: "Failed to get equipment" });
  }
};

export const getExpiringWarranties = async (req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const equipment = await prisma.equipment.findMany({
      where: {
        warrantyExpiry: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
      },
      orderBy: { warrantyExpiry: "asc" },
    });

    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error("Get expiring warranties error:", error);
    res.status(500).json({ success: false, error: "Failed to get equipment" });
  }
};
