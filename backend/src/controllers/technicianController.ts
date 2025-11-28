import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CreateTechnicianDto, UpdateLocationDto } from "../types";

export const createTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateTechnicianDto = req.body;

    const technician = await prisma.technician.create({
      data: {
        userId: data.userId,
        skills: data.skills || [],
        certifications: data.certifications || [],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: technician,
      message: "Technician created successfully",
    });
  } catch (error) {
    console.error("Create technician error:", error);
    res.status(500).json({ success: false, error: "Failed to create technician" });
  }
};

export const getAllTechnicians = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, available } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = available !== undefined ? { isAvailable: available === "true" } : {};

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          _count: {
            select: {
              jobs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.technician.count({ where }),
    ]);

    res.json({
      success: true,
      data: technicians,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all technicians error:", error);
    res.status(500).json({ success: false, error: "Failed to get technicians" });
  }
};

export const getTechnicianById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        jobs: {
          take: 10,
          orderBy: { scheduledDate: "desc" },
          include: {
            customer: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
        locations: {
          take: 1,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!technician) {
      res.status(404).json({ success: false, error: "Technician not found" });
      return;
    }

    res.json({ success: true, data: technician });
  } catch (error) {
    console.error("Get technician by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to get technician" });
  }
};

export const updateTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { skills, certifications, isAvailable } = req.body;

    const technician = await prisma.technician.update({
      where: { id },
      data: { skills, certifications, isAvailable },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    res.json({ success: true, data: technician, message: "Technician updated successfully" });
  } catch (error) {
    console.error("Update technician error:", error);
    res.status(500).json({ success: false, error: "Failed to update technician" });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const locationData: UpdateLocationDto = req.body;

    // Create location record
    const location = await prisma.location.create({
      data: {
        technicianId: id,
        ...locationData,
      },
    });

    // Update technician's current location
    await prisma.technician.update({
      where: { id },
      data: {
        currentLatitude: locationData.latitude,
        currentLongitude: locationData.longitude,
        lastLocationUpdate: new Date(),
      },
    });

    res.json({ success: true, data: location, message: "Location updated" });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ success: false, error: "Failed to update location" });
  }
};

export const getLocationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const where: { technicianId: string; timestamp?: { gte?: Date; lte?: Date } } = { technicianId: id };
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(String(startDate));
      if (endDate) where.timestamp.lte = new Date(String(endDate));
    }

    const locations = await prisma.location.findMany({
      where,
      take: Number(limit),
      orderBy: { timestamp: "desc" },
    });

    res.json({ success: true, data: locations });
  } catch (error) {
    console.error("Get location history error:", error);
    res.status(500).json({ success: false, error: "Failed to get location history" });
  }
};

export const getTechnicianSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const where: { technicianId: string; scheduledDate?: { gte?: Date; lte?: Date } } = { technicianId: id };
    
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(String(startDate));
      if (endDate) where.scheduledDate.lte = new Date(String(endDate));
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
        equipment: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Get technician schedule error:", error);
    res.status(500).json({ success: false, error: "Failed to get schedule" });
  }
};

export const getAvailableTechnicians = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, skills } = req.query;

    const technicians = await prisma.technician.findMany({
      where: {
        isAvailable: true,
        ...(skills && {
          skills: {
            hasSome: String(skills).split(","),
          },
        }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        jobs: {
          where: {
            scheduledDate: date ? new Date(String(date)) : undefined,
            status: { in: ["PENDING", "SCHEDULED", "IN_PROGRESS"] },
          },
        },
      },
    });

    res.json({ success: true, data: technicians });
  } catch (error) {
    console.error("Get available technicians error:", error);
    res.status(500).json({ success: false, error: "Failed to get available technicians" });
  }
};
