"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { Invoice, ApiResponse, InvoiceStatus } from "@/types";

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-yellow-100 text-yellow-800",
};

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", statusFilter, page],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Invoice[]>>("/invoices", {
        params: { 
          status: statusFilter || undefined,
          page, 
          limit: 10 
        },
      });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage billing and payments
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span> Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            {data?.pagination?.total || 0} invoices found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data?.data?.length ? (
            <div className="space-y-4">
              {data.data.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[invoice.status]
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.customer?.user?.firstName}{" "}
                        {invoice.customer?.user?.lastName}
                      </p>
                      {invoice.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${invoice.totalAmount.toLocaleString()}
                      </p>
                      {invoice.paidAmount > 0 && (
                        <p className="text-xs text-green-600">
                          Paid: ${invoice.paidAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
