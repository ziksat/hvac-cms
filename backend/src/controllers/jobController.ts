import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CreateJobDto, UpdateJobDto, JobStatus } from "../types";

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateJobDto = req.body;

    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        customerId: data.customerId,
        technicianId: data.technicianId,
        equipmentId: data.equipmentId,
        priority: data.priority || 1,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        estimatedDuration: data.estimatedDuration,
        photos: [],
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
        equipment: true,
      },
    });

    res.status(201).json({
      success: true,
      data: job,
      message: "Job created successfully",
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ success: false, error: "Failed to create job" });
  }
};

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, priority, customerId, technicianId, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: {
      status?: JobStatus;
      priority?: number;
      customerId?: string;
      technicianId?: string;
      scheduledDate?: { gte?: Date; lte?: Date };
    } = {};

    if (status) where.status = status as JobStatus;
    if (priority) where.priority = Number(priority);
    if (customerId) where.customerId = String(customerId);
    if (technicianId) where.technicianId = String(technicianId);
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(String(startDate));
      if (endDate) where.scheduledDate.lte = new Date(String(endDate));
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true, phone: true },
              },
            },
          },
          technician: {
            include: {
              user: {
                select: { firstName: true, lastName: true, phone: true },
              },
            },
          },
          equipment: true,
        },
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ success: false, error: "Failed to get jobs" });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
            locations: {
              take: 1,
              orderBy: { timestamp: "desc" },
            },
          },
        },
        equipment: true,
        estimate: true,
        invoice: true,
      },
    });

    if (!job) {
      res.status(404).json({ success: false, error: "Job not found" });
      return;
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to get job" });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateJobDto = req.body;

    // Handle status transitions
    const updateData: Record<string, unknown> = { ...data };
    if (data.status === JobStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
        equipment: true,
      },
    });

    res.json({ success: true, data: job, message: "Job updated successfully" });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ success: false, error: "Failed to update job" });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.job.delete({ where: { id } });

    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, error: "Failed to delete job" });
  }
};

export const assignTechnician = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { technicianId, scheduledDate, scheduledTime } = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: {
        technicianId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        scheduledTime,
        status: JobStatus.SCHEDULED,
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: job, message: "Technician assigned successfully" });
  } catch (error) {
    console.error("Assign technician error:", error);
    res.status(500).json({ success: false, error: "Failed to assign technician" });
  }
};

export const updateJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData: { status: JobStatus; completedAt?: Date } = { status };
    if (status === JobStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: job, message: "Job status updated" });
  } catch (error) {
    console.error("Update job status error:", error);
    res.status(500).json({ success: false, error: "Failed to update job status" });
  }
};

export const addJobPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { photos } = req.body; // Array of photo URLs

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ success: false, error: "Job not found" });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        photos: [...job.photos, ...photos],
      },
    });

    res.json({ success: true, data: updatedJob, message: "Photos added" });
  } catch (error) {
    console.error("Add job photos error:", error);
    res.status(500).json({ success: false, error: "Failed to add photos" });
  }
};

export const getJobsForScheduling = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const where: {
      scheduledDate: { gte: Date; lte: Date };
      status?: { in: JobStatus[] };
    } = {
      scheduledDate: {
        gte: startDate ? new Date(String(startDate)) : new Date(),
        lte: endDate ? new Date(String(endDate)) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      status: { in: [JobStatus.PENDING, JobStatus.SCHEDULED, JobStatus.IN_PROGRESS] },
    };

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
        technician: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Get jobs for scheduling error:", error);
    res.status(500).json({ success: false, error: "Failed to get jobs" });
  }
};
