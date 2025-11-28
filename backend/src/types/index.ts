export type Role = "ADMIN" | "DISPATCHER" | "TECHNICIAN" | "CUSTOMER";
export type JobStatus = "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type EstimateStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateCustomerDto {
  userId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
}

export interface CreateTechnicianDto {
  userId: string;
  skills?: string[];
  certifications?: string[];
}

export interface CreateJobDto {
  title: string;
  description?: string;
  customerId: string;
  technicianId?: string;
  equipmentId?: string;
  priority?: number;
  scheduledDate?: Date;
  scheduledTime?: string;
  estimatedDuration?: number;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  status?: JobStatus;
  technicianId?: string;
  equipmentId?: string;
  priority?: number;
  scheduledDate?: Date;
  scheduledTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  photos?: string[];
  parts?: object;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
}

export interface CreateEstimateDto {
  customerId: string;
  jobId?: string;
  description?: string;
  laborCost: number;
  partsCost: number;
  taxRate?: number;
  validUntil?: Date;
  customerNotes?: string;
  internalNotes?: string;
  lineItems?: EstimateLineItemDto[];
}

export interface EstimateLineItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  customerId: string;
  jobId?: string;
  description?: string;
  subtotal: number;
  taxRate?: number;
  dueDate?: Date;
  notes?: string;
  lineItems?: InvoiceLineItemDto[];
}

export interface InvoiceLineItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateEquipmentDto {
  customerId: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: Date;
  warrantyExpiry?: Date;
  notes?: string;
}

export interface UpdateLocationDto {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
