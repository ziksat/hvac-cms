import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { JobStatus, InvoiceStatus, EstimateStatus } from "@prisma/client";

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [
      totalCustomers,
      totalTechnicians,
      totalJobs,
      pendingJobs,
      inProgressJobs,
      completedJobsThisMonth,
      totalRevenue,
      revenueThisMonth,
      pendingInvoices,
      overdueInvoices,
      pendingEstimates,
      jobsToday,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.technician.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: JobStatus.PENDING } }),
      prisma.job.count({ where: { status: JobStatus.IN_PROGRESS } }),
      prisma.job.count({
        where: {
          status: JobStatus.COMPLETED,
          completedAt: { gte: startOfMonth },
        },
      }),
      prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PAID },
        _sum: { paidAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: startOfMonth },
        },
        _sum: { paidAmount: true },
      }),
      prisma.invoice.count({ where: { status: InvoiceStatus.SENT } }),
      prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      prisma.estimate.count({ where: { status: EstimateStatus.SENT } }),
      prisma.job.count({
        where: {
          scheduledDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
        },
        technicians: {
          total: totalTechnicians,
        },
        jobs: {
          total: totalJobs,
          pending: pendingJobs,
          inProgress: inProgressJobs,
          completedThisMonth: completedJobsThisMonth,
          today: jobsToday,
        },
        revenue: {
          total: totalRevenue._sum.paidAmount || 0,
          thisMonth: revenueThisMonth._sum.paidAmount || 0,
        },
        invoices: {
          pending: pendingInvoices,
          overdue: overdueInvoices,
        },
        estimates: {
          pending: pendingEstimates,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to get dashboard stats" });
  }
};

export const getRevenueReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;

    const start = startDate ? new Date(String(startDate)) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(String(endDate)) : new Date();

    const invoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.PAID,
        paidAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        paidAmount: true,
        paidAt: true,
      },
      orderBy: { paidAt: "asc" },
    });

    // Group by period
    const revenueByPeriod = new Map<string, number>();
    
    for (const invoice of invoices) {
      if (!invoice.paidAt) continue;
      
      let periodKey: string;
      if (groupBy === "day") {
        periodKey = invoice.paidAt.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(invoice.paidAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        periodKey = weekStart.toISOString().split("T")[0];
      } else {
        periodKey = `${invoice.paidAt.getFullYear()}-${String(invoice.paidAt.getMonth() + 1).padStart(2, "0")}`;
      }
      
      revenueByPeriod.set(periodKey, (revenueByPeriod.get(periodKey) || 0) + invoice.paidAmount);
    }

    const data = Array.from(revenueByPeriod.entries()).map(([period, amount]) => ({
      period,
      amount,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get revenue report error:", error);
    res.status(500).json({ success: false, error: "Failed to get revenue report" });
  }
};

export const getTechnicianPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(String(startDate)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(String(endDate)) : new Date();

    const technicians = await prisma.technician.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        jobs: {
          where: {
            completedAt: {
              gte: start,
              lte: end,
            },
          },
          select: {
            id: true,
            totalCost: true,
            actualDuration: true,
            estimatedDuration: true,
          },
        },
      },
    });

    const performance = technicians.map((tech) => {
      const completedJobs = tech.jobs.length;
      const totalRevenue = tech.jobs.reduce((sum, job) => sum + (job.totalCost || 0), 0);
      const avgDuration = tech.jobs.length > 0
        ? tech.jobs.reduce((sum, job) => sum + (job.actualDuration || 0), 0) / tech.jobs.length
        : 0;
      const onTimeRate = tech.jobs.length > 0
        ? tech.jobs.filter((job) => 
            job.actualDuration && job.estimatedDuration && job.actualDuration <= job.estimatedDuration
          ).length / tech.jobs.length * 100
        : 0;

      return {
        id: tech.id,
        name: `${tech.user.firstName} ${tech.user.lastName}`,
        completedJobs,
        totalRevenue,
        avgDuration: Math.round(avgDuration),
        onTimeRate: Math.round(onTimeRate),
      };
    });

    res.json({ success: true, data: performance });
  } catch (error) {
    console.error("Get technician performance error:", error);
    res.status(500).json({ success: false, error: "Failed to get technician performance" });
  }
};

export const getJobStatusBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const statuses = await prisma.job.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const data = statuses.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get job status breakdown error:", error);
    res.status(500).json({ success: false, error: "Failed to get job status breakdown" });
  }
};

export const getRecentActivity = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [recentJobs, recentEstimates, recentInvoices] = await Promise.all([
      prisma.job.findMany({
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          technician: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.estimate.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        recentJobs,
        recentEstimates,
        recentInvoices,
      },
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({ success: false, error: "Failed to get recent activity" });
  }
};
