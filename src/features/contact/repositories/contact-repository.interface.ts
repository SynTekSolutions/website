import { Lead, LeadFilters, PaginatedResult, UpdateLeadInput } from "../types";

export interface ContactRepository {
  /**
   * Obtiene un listado paginado de leads que coinciden con los filtros.
   */
  find(filters: LeadFilters): Promise<PaginatedResult<Lead>>;

  /**
   * Obtiene un lead detallado por su ID.
   */
  findById(id: string): Promise<Lead | null>;

  /**
   * Persiste un nuevo lead en la base de datos.
   */
  create(lead: Lead): Promise<void>;

  /**
   * Actualiza parcialmente un lead existente en la base de datos de forma atómica
   * utilizando la función RPC para fundir metadatos JSONB.
   */
  update(id: string, changes: UpdateLeadInput): Promise<Lead>;
}
