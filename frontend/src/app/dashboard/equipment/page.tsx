"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { Equipment, ApiResponse } from "@/types";

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["equipment", search, typeFilter, page],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Equipment[]>>("/equipment", {
        params: { 
          search,
          type: typeFilter || undefined,
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
          <h1 className="text-3xl font-bold">Equipment</h1>
          <p className="text-muted-foreground">
            Track customer HVAC equipment
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span> Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              <option value="AC">Air Conditioner</option>
              <option value="Furnace">Furnace</option>
              <option value="Heat Pump">Heat Pump</option>
              <option value="Boiler">Boiler</option>
              <option value="Mini Split">Mini Split</option>
              <option value="Thermostat">Thermostat</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data?.data?.length ? (
          data.data.map((equipment) => (
            <Card key={equipment.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="text-xl">🏠</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{equipment.name}</CardTitle>
                    <CardDescription>{equipment.type}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {equipment.brand && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand</span>
                      <span>{equipment.brand}</span>
                    </div>
                  )}
                  {equipment.model && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span>{equipment.model}</span>
                    </div>
                  )}
                  {equipment.serialNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial</span>
                      <span className="font-mono text-xs">{equipment.serialNumber}</span>
                    </div>
                  )}
                  {equipment.warrantyExpiry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty</span>
                      <span
                        className={
                          new Date(equipment.warrantyExpiry) < new Date()
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {new Date(equipment.warrantyExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service History</span>
                    <span>{equipment._count?.jobs || 0} jobs</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium">
                      {equipment.customer?.user?.firstName}{" "}
                      {equipment.customer?.user?.lastName}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No equipment found.
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
