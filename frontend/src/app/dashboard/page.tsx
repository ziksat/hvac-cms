"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { DashboardStats, ApiResponse } from "@/types";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.revenue.total.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats?.revenue.thisMonth.toLocaleString() || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <span className="text-2xl">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.jobs.pending || 0) + (stats?.jobs.inProgress || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.jobs.today || 0} scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customers.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <span className="text-2xl">🔧</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.technicians.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active technicians</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Jobs Overview</CardTitle>
            <CardDescription>Current job status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{stats?.jobs.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-medium">{stats?.jobs.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Completed (This Month)</span>
                </div>
                <span className="font-medium">
                  {stats?.jobs.completedThisMonth || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{stats?.invoices.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="font-medium">{stats?.invoices.overdue || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
            <CardDescription>Awaiting customer response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Pending Approval</span>
                </div>
                <span className="font-medium">{stats?.estimates.pending || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/dashboard/jobs?action=new"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium">Create Job</p>
                <p className="text-sm text-muted-foreground">
                  Start a new work order
                </p>
              </div>
            </a>
            <a
              href="/dashboard/customers?action=new"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-medium">Add Customer</p>
                <p className="text-sm text-muted-foreground">
                  Register new customer
                </p>
              </div>
            </a>
            <a
              href="/dashboard/estimates?action=new"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium">Create Estimate</p>
                <p className="text-sm text-muted-foreground">
                  Send a quote to customer
                </p>
              </div>
            </a>
            <a
              href="/dashboard/schedule"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium">View Schedule</p>
                <p className="text-sm text-muted-foreground">
                  See today&apos;s appointments
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
