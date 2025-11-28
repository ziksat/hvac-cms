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
import { Estimate, ApiResponse, EstimateStatus } from "@/types";

const statusColors: Record<EstimateStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  SENT: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-yellow-100 text-yellow-800",
};

export default function EstimatesPage() {
  const [statusFilter, setStatusFilter] = useState<EstimateStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["estimates", statusFilter, page],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Estimate[]>>("/estimates", {
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
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-muted-foreground">
            Create and manage job estimates
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span> Create Estimate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EstimateStatus | "")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Estimates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
          <CardDescription>
            {data?.pagination?.total || 0} estimates found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data?.data?.length ? (
            <div className="space-y-4">
              {data.data.map((estimate) => (
                <div
                  key={estimate.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{estimate.estimateNumber}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[estimate.status]
                          }`}
                        >
                          {estimate.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {estimate.customer?.user?.firstName}{" "}
                        {estimate.customer?.user?.lastName}
                      </p>
                      {estimate.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {estimate.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${estimate.totalCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Labor: ${estimate.laborCost.toLocaleString()} | Parts: $
                        {estimate.partsCost.toLocaleString()}
                      </p>
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
              No estimates found. Create your first estimate to get started.
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
