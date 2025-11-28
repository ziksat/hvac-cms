import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CreateEstimateDto, EstimateStatus } from "../types";
import { generateEstimateNumber, calculateTotal } from "../utils/helpers";

export const createEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateEstimateDto = req.body;

    const taxRate = data.taxRate || 0;
    const subtotal = data.laborCost + data.partsCost;
    const totalCost = calculateTotal(subtotal, taxRate);

    const estimate = await prisma.estimate.create({
      data: {
        estimateNumber: generateEstimateNumber(),
        customerId: data.customerId,
        jobId: data.jobId,
        description: data.description,
        laborCost: data.laborCost,
        partsCost: data.partsCost,
        taxRate,
        totalCost,
        validUntil: data.validUntil,
        customerNotes: data.customerNotes,
        internalNotes: data.internalNotes,
        lineItems: {
          create: data.lineItems?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        job: true,
        lineItems: true,
      },
    });

    res.status(201).json({
      success: true,
      data: estimate,
      message: "Estimate created successfully",
    });
  } catch (error) {
    console.error("Create estimate error:", error);
    res.status(500).json({ success: false, error: "Failed to create estimate" });
  }
};

export const getAllEstimates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: { status?: EstimateStatus; customerId?: string } = {};
    if (status) where.status = status as EstimateStatus;
    if (customerId) where.customerId = String(customerId);

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
          job: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.estimate.count({ where }),
    ]);

    res.json({
      success: true,
      data: estimates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all estimates error:", error);
    res.status(500).json({ success: false, error: "Failed to get estimates" });
  }
};

export const getEstimateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        job: true,
        lineItems: true,
      },
    });

    if (!estimate) {
      res.status(404).json({ success: false, error: "Estimate not found" });
      return;
    }

    res.json({ success: true, data: estimate });
  } catch (error) {
    console.error("Get estimate by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to get estimate" });
  }
};

export const updateEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, laborCost, partsCost, taxRate, validUntil, customerNotes, internalNotes } = req.body;

    const updateData: Record<string, unknown> = {};
    if (description !== undefined) updateData.description = description;
    if (laborCost !== undefined) updateData.laborCost = laborCost;
    if (partsCost !== undefined) updateData.partsCost = partsCost;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (validUntil !== undefined) updateData.validUntil = validUntil;
    if (customerNotes !== undefined) updateData.customerNotes = customerNotes;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    // Recalculate total if costs changed
    if (laborCost !== undefined || partsCost !== undefined || taxRate !== undefined) {
      const existing = await prisma.estimate.findUnique({ where: { id } });
      if (existing) {
        const newLaborCost = laborCost ?? existing.laborCost;
        const newPartsCost = partsCost ?? existing.partsCost;
        const newTaxRate = taxRate ?? existing.taxRate;
        updateData.totalCost = calculateTotal(newLaborCost + newPartsCost, newTaxRate);
      }
    }

    const estimate = await prisma.estimate.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        lineItems: true,
      },
    });

    res.json({ success: true, data: estimate, message: "Estimate updated successfully" });
  } catch (error) {
    console.error("Update estimate error:", error);
    res.status(500).json({ success: false, error: "Failed to update estimate" });
  }
};

export const sendEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        status: EstimateStatus.SENT,
        sentAt: new Date(),
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    // TODO: Send email/SMS notification via Azure Communication Services

    res.json({ success: true, data: estimate, message: "Estimate sent to customer" });
  } catch (error) {
    console.error("Send estimate error:", error);
    res.status(500).json({ success: false, error: "Failed to send estimate" });
  }
};

export const approveEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        status: EstimateStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    res.json({ success: true, data: estimate, message: "Estimate approved" });
  } catch (error) {
    console.error("Approve estimate error:", error);
    res.status(500).json({ success: false, error: "Failed to approve estimate" });
  }
};

export const rejectEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        status: EstimateStatus.REJECTED,
        rejectedAt: new Date(),
        internalNotes: reason,
      },
    });

    res.json({ success: true, data: estimate, message: "Estimate rejected" });
  } catch (error) {
    console.error("Reject estimate error:", error);
    res.status(500).json({ success: false, error: "Failed to reject estimate" });
  }
};

export const deleteEstimate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.estimate.delete({ where: { id } });

    res.json({ success: true, message: "Estimate deleted successfully" });
  } catch (error) {
    console.error("Delete estimate error:", error);
    res.status(500).json({ success: false, error: "Failed to delete estimate" });
  }
};
