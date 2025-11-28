import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CreateInvoiceDto, InvoiceStatus } from "../types";
import { generateInvoiceNumber, calculateTax } from "../utils/helpers";

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateInvoiceDto = req.body;

    const taxRate = data.taxRate || 0;
    const taxAmount = calculateTax(data.subtotal, taxRate);
    const totalAmount = data.subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        customerId: data.customerId,
        jobId: data.jobId,
        description: data.description,
        subtotal: data.subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        dueDate: data.dueDate,
        notes: data.notes,
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
      data: invoice,
      message: "Invoice created successfully",
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ success: false, error: "Failed to create invoice" });
  }
};

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: { status?: InvoiceStatus; customerId?: string } = {};
    if (status) where.status = status as InvoiceStatus;
    if (customerId) where.customerId = String(customerId);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
      prisma.invoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all invoices error:", error);
    res.status(500).json({ success: false, error: "Failed to get invoices" });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
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

    if (!invoice) {
      res.status(404).json({ success: false, error: "Invoice not found" });
      return;
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Get invoice by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to get invoice" });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, subtotal, taxRate, dueDate, notes } = req.body;

    const updateData: Record<string, unknown> = {};
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate totals if amounts changed
    if (subtotal !== undefined || taxRate !== undefined) {
      const existing = await prisma.invoice.findUnique({ where: { id } });
      if (existing) {
        const newSubtotal = subtotal ?? existing.subtotal;
        const newTaxRate = taxRate ?? existing.taxRate;
        const newTaxAmount = calculateTax(newSubtotal, newTaxRate);
        updateData.subtotal = newSubtotal;
        updateData.taxRate = newTaxRate;
        updateData.taxAmount = newTaxAmount;
        updateData.totalAmount = newSubtotal + newTaxAmount;
      }
    }

    const invoice = await prisma.invoice.update({
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

    res.json({ success: true, data: invoice, message: "Invoice updated successfully" });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ success: false, error: "Failed to update invoice" });
  }
};

export const sendInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
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

    res.json({ success: true, data: invoice, message: "Invoice sent to customer" });
  } catch (error) {
    console.error("Send invoice error:", error);
    res.status(500).json({ success: false, error: "Failed to send invoice" });
  }
};

export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      res.status(404).json({ success: false, error: "Invoice not found" });
      return;
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const status = newPaidAmount >= invoice.totalAmount ? InvoiceStatus.PAID : invoice.status;

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status,
        paidAt: status === InvoiceStatus.PAID ? new Date() : null,
      },
    });

    res.json({ success: true, data: updatedInvoice, message: "Payment recorded" });
  } catch (error) {
    console.error("Record payment error:", error);
    res.status(500).json({ success: false, error: "Failed to record payment" });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({ where: { id } });

    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ success: false, error: "Failed to delete invoice" });
  }
};

export const getOverdueInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.SENT,
        dueDate: { lt: new Date() },
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
      orderBy: { dueDate: "asc" },
    });

    // Update status to OVERDUE
    for (const invoice of invoices) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.OVERDUE },
      });
    }

    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Get overdue invoices error:", error);
    res.status(500).json({ success: false, error: "Failed to get overdue invoices" });
  }
};
