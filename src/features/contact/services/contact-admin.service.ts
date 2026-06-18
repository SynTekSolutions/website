import "server-only";
import { SupabaseContactRepository } from "../repositories/supabase-contact.repository";
import { LeadFilters, LeadListItemDTO, LeadDetailDTO, UpdateLeadInput } from "../types";

const contactRepo = new SupabaseContactRepository();

/**
 * Servicio administrativo para la gestión de leads (CRM).
 * Oculta las entidades de dominio y retorna DTOs optimizados para el listado o detalle.
 */
export class ContactAdminService {
  /**
   * Retorna un listado ligero de leads mapeados a LeadListItemDTO[].
   */
  static async getLeads(filters: LeadFilters) {
    const result = await contactRepo.find(filters);
    return {
      items: result.items.map((lead): LeadListItemDTO => ({
        id:         lead.id,
        name:       lead.name,
        company:    lead.company,
        service:    lead.service,
        status:     lead.status,
        created_at: lead.created_at.toISOString(),
      })),
      total:    result.total,
      page:     result.page,
      pageSize: result.pageSize,
      hasNext:  result.hasNext,
    };
  }

  /**
   * Retorna los detalles completos de un lead mapeados a LeadDetailDTO,
   * cargado diferidamente.
   */
  static async getLeadById(id: string): Promise<LeadDetailDTO | null> {
    const lead = await contactRepo.findById(id);
    if (!lead) return null;

    return {
      id:         lead.id,
      name:       lead.name,
      email:      lead.email,
      phone:      lead.phone,
      company:    lead.company,
      service:    lead.service,
      message:    lead.message,
      status:     lead.status,
      origin:     lead.origin,
      created_at: lead.created_at.toISOString(),
      updated_at: lead.updated_at.toISOString(),
      metadata:   lead.metadata,
    };
  }

  /**
   * Actualiza el lead de forma atómica y retorna el DTO del lead actualizado.
   */
  static async updateLead(id: string, changes: UpdateLeadInput): Promise<LeadDetailDTO> {
    const lead = await contactRepo.update(id, changes);

    return {
      id:         lead.id,
      name:       lead.name,
      email:      lead.email,
      phone:      lead.phone,
      company:    lead.company,
      service:    lead.service,
      message:    lead.message,
      status:     lead.status,
      origin:     lead.origin,
      created_at: lead.created_at.toISOString(),
      updated_at: lead.updated_at.toISOString(),
      metadata:   lead.metadata,
    };
  }
}
