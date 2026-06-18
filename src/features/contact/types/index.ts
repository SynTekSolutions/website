import { LeadStatus } from "@/lib/notifications/channels/notification-channel.interface";

export interface LeadMetadata {
  ip?:         string;
  userAgent?:  string;
  referrer?:   string;
  utm?: {
    source?:   string;
    medium?:   string;
    campaign?: string;
    term?:     string;
    content?:  string;
  };
  notes?:      string;
  assignedTo?: string;
  [key: string]: unknown; // Conserva flexibilidad total para el futuro
}

export interface Lead {
  id:         string;
  name:       string;
  email:      string;
  phone:      string | null;
  company:    string;
  service:    string;
  message:    string;
  status:     LeadStatus;
  origin:     string;
  created_at: Date;
  updated_at: Date;
  metadata:   LeadMetadata;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  metadata?: LeadMetadata;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  service?: string;
  origin?: string;
  date?: {
    from?: string;
    to?: string;
  };
  // Paginación flexible preparada para cursores futuros
  pagination?: {
    page?: number;
    pageSize: number;
    cursor?: string;
  };
  sort?: {
    field: "created_at" | "updated_at";
    direction: "asc" | "desc";
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

// ─── DTOs (Data Transfer Objects) ──────────────────────────────────────────
export interface LeadListItemDTO {
  id:         string;
  name:       string;
  company:    string;
  service:    string;
  status:     LeadStatus;
  created_at: string | Date;
}

export interface LeadDetailDTO {
  id:         string;
  name:       string;
  email:      string;
  phone:      string | null;
  company:    string;
  service:    string;
  message:    string;
  status:     LeadStatus;
  origin:     string;
  created_at: string | Date;
  updated_at: string | Date;
  metadata:   LeadMetadata;
}
