import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { LEAD_STATUSES, LeadStatus } from "@/lib/notifications/channels/notification-channel.interface";
import { Lead, LeadFilters, PaginatedResult, UpdateLeadInput } from "../types";
import { ContactRepository } from "./contact-repository.interface";
import { NotFoundError } from "@/lib/api-helper";

interface DatabaseLead {
  id:          string;
  name:        string;
  email:       string;
  phone:       string | null;
  company:     string | null;
  service:     string | null;
  message:     string;
  status:      string;
  origin:      string;
  metadata:    unknown;
  created_at:  Date | string;
  updated_at:  Date | string;
}

/**
 * Validador en tiempo de ejecución para el estado del lead.
 */
function toLeadStatus(value: string): LeadStatus {
  if (!LEAD_STATUSES.includes(value as LeadStatus)) {
    throw new Error(`Invalid lead status in database: ${value}`);
  }
  return value as LeadStatus;
}

/**
 * Mapeador de base de datos a dominio.
 */
function toDomain(row: DatabaseLead): Lead {
  return {
    id:         row.id,
    name:       row.name,
    email:      row.email,
    phone:      row.phone,
    company:    row.company ?? "",
    service:    row.service ?? "",
    message:    row.message,
    status:     toLeadStatus(row.status),
    origin:     row.origin,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    metadata:   typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata || {},
  };
}

export class SupabaseContactRepository implements ContactRepository {
  async find(filters: LeadFilters): Promise<PaginatedResult<Lead>> {
    const page = filters.pagination?.page ?? 1;
    const pageSize = filters.pagination?.pageSize ?? 20;
    const sortField = filters.sort?.field ?? "created_at";
    const sortAsc = filters.sort?.direction === "asc";

    const where: Prisma.contactsWhereInput = {};

    if (filters.search) {
      const searchPattern = filters.search;
      where.OR = [
        { name: { contains: searchPattern, mode: "insensitive" } },
        { email: { contains: searchPattern, mode: "insensitive" } },
        { company: { contains: searchPattern, mode: "insensitive" } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.service) {
      where.service = filters.service;
    }
    if (filters.origin) {
      where.origin = filters.origin;
    }

    if (filters.date?.from || filters.date?.to) {
      where.created_at = {};
      if (filters.date.from) {
        where.created_at.gte = filters.date.from;
      }
      if (filters.date.to) {
        where.created_at.lte = filters.date.to;
      }
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const orderBy: Prisma.contactsOrderByWithRelationInput[] = [
      { [sortField === "created_at" ? "created_at" : sortField]: sortAsc ? "asc" : "desc" },
      { id: "desc" },
    ];

    const [data, count] = await Promise.all([
      prisma.contacts.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.contacts.count({ where }),
    ]);

    const items = (data as unknown as DatabaseLead[] || []).map(toDomain);
    const total = count ?? 0;
    const hasNext = total > page * pageSize;

    return {
      items,
      total,
      page,
      pageSize,
      hasNext,
    };
  }

  async findById(id: string): Promise<Lead | null> {
    const data = await prisma.contacts.findUnique({
      where: { id },
    });

    if (!data) return null;
    return toDomain(data as unknown as DatabaseLead);
  }

  async create(lead: Lead): Promise<void> {
    await prisma.contacts.create({
      data: {
        id:         lead.id,
        name:       lead.name,
        email:      lead.email,
        phone:      lead.phone,
        company:    lead.company,
        service:    lead.service,
        message:    lead.message,
        status:     lead.status,
        origin:     lead.origin,
        metadata:   (lead.metadata || {}) as unknown as Prisma.InputJsonValue,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      },
    });
  }

  async update(id: string, changes: UpdateLeadInput): Promise<Lead> {
    try {
      // Execute atomic update via SQL function update_contact_v1 using raw query
      const data = await prisma.$queryRaw<unknown[]>`
        SELECT * FROM update_contact_v1(${id}::uuid, ${changes.status || null}, ${changes.metadata ? JSON.stringify(changes.metadata) : null}::jsonb)
      `;
      const row = data[0] as DatabaseLead | undefined;
      if (!row) {
        throw new NotFoundError("Lead not found");
      }
      return toDomain(row);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Contact not found")) {
        throw new NotFoundError("Lead not found");
      }
      throw error;
    }
  }
}
