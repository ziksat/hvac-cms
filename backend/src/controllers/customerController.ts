import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CreateCustomerDto } from "../types";

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateCustomerDto = req.body;

    const customer = await prisma.customer.create({
      data,
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
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ success: false, error: "Failed to create customer" });
  }
};

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { user: { firstName: { contains: String(search) } } },
            { user: { lastName: { contains: String(search) } } },
            { user: { email: { contains: String(search) } } },
            { address: { contains: String(search) } },
            { city: { contains: String(search) } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
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
              equipment: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all customers error:", error);
    res.status(500).json({ success: false, error: "Failed to get customers" });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
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
        equipment: true,
        estimates: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, error: "Customer not found" });
      return;
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("Get customer by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to get customer" });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { address, city, state, zipCode, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: { address, city, state, zipCode, notes },
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

    res.json({ success: true, data: customer, message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ success: false, error: "Failed to update customer" });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({ where: { id } });

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ success: false, error: "Failed to delete customer" });
  }
};

export const getCustomerServiceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { customerId: id },
        skip,
        take: Number(limit),
        include: {
          technician: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          equipment: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where: { customerId: id } }),
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
    console.error("Get customer service history error:", error);
    res.status(500).json({ success: false, error: "Failed to get service history" });
  }
};
