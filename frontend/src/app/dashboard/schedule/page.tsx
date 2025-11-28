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
import { Job, ApiResponse, JobStatus } from "@/types";

const statusColors: Record<JobStatus, string> = {
  PENDING: "bg-yellow-500",
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-purple-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const { data, isLoading } = useQuery({
    queryKey: ["schedule", startOfWeek.toISOString()],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Job[]>>("/jobs/scheduling", {
        params: {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
        },
      });
      return response.data;
    },
  });

  // Group jobs by date
  const jobsByDate = data?.data?.reduce((acc, job) => {
    if (job.scheduledDate) {
      const dateKey = new Date(job.scheduledDate).toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(job);
    }
    return acc;
  }, {} as Record<string, Job[]>) || {};

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  const goToPrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate.toISOString().split("T")[0]);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage job schedules
          </p>
        </div>
        <Button>
          <span className="mr-2">➕</span> Schedule Job
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevWeek}>
                ← Previous
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                Next →
              </Button>
            </div>
            <div className="text-lg font-medium">
              {startOfWeek.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {endOfWeek.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateKey = day.toISOString().split("T")[0];
            const dayJobs = jobsByDate[dateKey] || [];
            const isToday = dateKey === new Date().toISOString().split("T")[0];

            return (
              <Card
                key={dateKey}
                className={isToday ? "ring-2 ring-primary" : ""}
              >
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-center">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </CardTitle>
                  <CardDescription className="text-center text-lg font-bold">
                    {day.getDate()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2 min-h-[200px]">
                    {dayJobs.length > 0 ? (
                      dayJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-2 rounded-md bg-slate-50 border text-xs cursor-pointer hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                statusColors[job.status]
                              }`}
                            ></div>
                            <span className="font-medium truncate">
                              {job.scheduledTime || "TBD"}
                            </span>
                          </div>
                          <p className="font-medium truncate">{job.title}</p>
                          <p className="text-muted-foreground truncate">
                            {job.customer?.user?.firstName}{" "}
                            {job.customer?.user?.lastName}
                          </p>
                          {job.technician && (
                            <p className="text-primary truncate">
                              {job.technician.user?.firstName}{" "}
                              {job.technician.user?.lastName?.[0]}.
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        No jobs
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span>{status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
