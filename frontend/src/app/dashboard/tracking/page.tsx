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
import { Technician, ApiResponse } from "@/types";

export default function TrackingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["technicians-tracking"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Technician[]>>("/technicians", {
        params: { available: true },
      });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const techniciansWithLocation = data?.data?.filter(
    (t) => t.currentLatitude && t.currentLongitude
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Tracking</h1>
        <p className="text-muted-foreground">
          Track technician locations in real-time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Map View</CardTitle>
            <CardDescription>
              Azure Maps integration showing technician locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl">🗺️</span>
                <p className="mt-4 text-muted-foreground">
                  Azure Maps Integration
                </p>
                <p className="text-sm text-muted-foreground">
                  Real-time GPS tracking will be displayed here
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Configure AZURE_MAPS_SUBSCRIPTION_KEY to enable
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technician List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Technicians</CardTitle>
            <CardDescription>
              {techniciansWithLocation.length} technicians online
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : techniciansWithLocation.length > 0 ? (
              <div className="space-y-4">
                {techniciansWithLocation.map((technician) => (
                  <div
                    key={technician.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {technician.user?.firstName?.[0]}
                          {technician.user?.lastName?.[0]}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {technician.user?.firstName} {technician.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated:{" "}
                        {technician.lastLocationUpdate
                          ? new Date(technician.lastLocationUpdate).toLocaleTimeString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-muted-foreground">
                        {technician.currentLatitude?.toFixed(4)},
                      </p>
                      <p className="text-muted-foreground">
                        {technician.currentLongitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl">📍</span>
                <p className="mt-2">No technicians currently online</p>
                <p className="text-sm">
                  Location data updates when technicians are active
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🚗</span> Real-Time GPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track technician vehicles in real-time with automatic location updates
              every 30 seconds.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>⏱️</span> ETA Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Azure Maps provides accurate ETAs based on current traffic conditions
              and route optimization.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔗</span> Customer Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Share tracking links with customers so they can see their technician's
              location and estimated arrival.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
