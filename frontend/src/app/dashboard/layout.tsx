"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Customers", href: "/dashboard/customers", icon: "👥" },
  { name: "Jobs", href: "/dashboard/jobs", icon: "📋" },
  { name: "Technicians", href: "/dashboard/technicians", icon: "🔧" },
  { name: "Estimates", href: "/dashboard/estimates", icon: "💵" },
  { name: "Invoices", href: "/dashboard/invoices", icon: "📄" },
  { name: "Equipment", href: "/dashboard/equipment", icon: "🏠" },
  { name: "Schedule", href: "/dashboard/schedule", icon: "📅" },
  { name: "Tracking", href: "/dashboard/tracking", icon: "📍" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-bold">HVAC CMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
