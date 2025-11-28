import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-bold">HVAC CMS</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Complete HVAC Business
          <span className="text-primary block mt-2">Management Solution</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Streamline your HVAC business with our comprehensive customer management system.
          Manage customers, dispatch technicians, track jobs, and send invoices all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Run Your HVAC Business
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg">
                  👥
                </span>
                Customer Management
              </CardTitle>
              <CardDescription>
                Complete customer profiles with service history and equipment tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Customer profiles & contact info</li>
                <li>• Service history tracking</li>
                <li>• Equipment inventory</li>
                <li>• Notes and documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-lg">
                  📋
                </span>
                Job Management
              </CardTitle>
              <CardDescription>
                Create, schedule, and track work orders from start to finish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Work order creation</li>
                <li>• Status tracking</li>
                <li>• Photo documentation</li>
                <li>• Parts tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-lg">
                  📅
                </span>
                Scheduling & Dispatch
              </CardTitle>
              <CardDescription>
                Efficiently schedule and dispatch technicians to job sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Calendar view</li>
                <li>• Drag-and-drop scheduling</li>
                <li>• Technician availability</li>
                <li>• Route optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-lg">
                  💰
                </span>
                Estimates & Invoicing
              </CardTitle>
              <CardDescription>
                Create professional estimates and invoices with approval workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Professional estimates</li>
                <li>• Customer approval workflow</li>
                <li>• Invoice generation</li>
                <li>• Payment tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-lg">
                  📍
                </span>
                Real-Time Tracking
              </CardTitle>
              <CardDescription>
                Track technician locations with Azure Maps integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Live GPS tracking</li>
                <li>• ETA calculations</li>
                <li>• Customer tracking links</li>
                <li>• Route history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg">
                  📊
                </span>
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive dashboards and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Revenue tracking</li>
                <li>• Technician performance</li>
                <li>• Job completion rates</li>
                <li>• Customer insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your HVAC Business?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of HVAC professionals who trust our platform to manage their business.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="text-white font-bold">HVAC CMS</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} HVAC CMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
