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
import { Technician, ApiResponse } from "@/types";

export default function TechniciansPage() {
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["technicians", availableOnly, page],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Technician[]>>("/technicians", {
        params: { 
          available: availableOnly || undefined,
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
          <h1 className="text-3xl font-bold">Technicians</h1>
          <p className="text-muted-foreground">
            Manage your technician team
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span> Add Technician
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show available only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data?.data?.length ? (
          data.data.map((technician) => (
            <Card key={technician.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {technician.user?.firstName?.[0]}
                      {technician.user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {technician.user?.firstName} {technician.user?.lastName}
                    </CardTitle>
                    <CardDescription>{technician.user?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        technician.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {technician.isAvailable ? "Available" : "Busy"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobs</span>
                    <span className="font-medium">
                      {technician._count?.jobs || 0}
                    </span>
                  </div>
                  {technician.skills?.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Skills</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {technician.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-100 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {technician.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                            +{technician.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No technicians found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
    </div>
  );
}
