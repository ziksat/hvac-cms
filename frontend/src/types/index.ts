export type Role = "ADMIN" | "DISPATCHER" | "TECHNICIAN" | "CUSTOMER";

export type JobStatus = "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type EstimateStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  user: Omit<User, "password">;
  jobs?: Job[];
  equipment?: Equipment[];
  _count?: {
    jobs: number;
    equipment: number;
  };
}

export interface Technician {
  id: string;
  userId: string;
  skills: string[];
  certifications: string[];
  isAvailable: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: string;
  user: Omit<User, "password">;
  jobs?: Job[];
  locations?: Location[];
  _count?: {
    jobs: number;
  };
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  priority: number;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  photos: string[];
  parts?: Record<string, unknown>;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  completedAt?: string;
  customerId: string;
  technicianId?: string;
  equipmentId?: string;
  customer?: Customer;
  technician?: Technician;
  equipment?: Equipment;
  estimate?: Estimate;
  invoice?: Invoice;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  status: EstimateStatus;
  description?: string;
  laborCost: number;
  partsCost: number;
  taxRate: number;
  totalCost: number;
  validUntil?: string;
  customerNotes?: string;
  internalNotes?: string;
  sentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  customerId: string;
  jobId?: string;
  customer?: Customer;
  job?: Job;
  lineItems?: EstimateLineItem[];
}

export interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  description?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
  paidAt?: string;
  sentAt?: string;
  notes?: string;
  customerId: string;
  jobId?: string;
  customer?: Customer;
  job?: Job;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  customerId: string;
  customer?: Customer;
  jobs?: Job[];
  _count?: {
    jobs: number;
  };
}

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
  technicianId: string;
}

export interface DashboardStats {
  customers: {
    total: number;
  };
  technicians: {
    total: number;
  };
  jobs: {
    total: number;
    pending: number;
    inProgress: number;
    completedThisMonth: number;
    today: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
  invoices: {
    pending: number;
    overdue: number;
  };
  estimates: {
    pending: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
}
