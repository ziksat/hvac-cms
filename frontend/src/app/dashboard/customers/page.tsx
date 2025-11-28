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
import { Customer, ApiResponse } from "@/types";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search, page],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Customer[]>>("/customers", {
        params: { search, page, limit: 10 },
      });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span> Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search customers by name, email, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {data?.pagination?.total || 0} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data?.data?.length ? (
            <div className="space-y-4">
              {data.data.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {customer.user?.firstName?.[0]}
                        {customer.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {customer.user?.firstName} {customer.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.address}, {customer.city}, {customer.state}{" "}
                        {customer.zipCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="font-medium">{customer._count?.jobs || 0}</span> jobs
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer._count?.equipment || 0} equipment
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
              No customers found. Add your first customer to get started.
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
