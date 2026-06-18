import { NextRequest, NextResponse } from "next/server";
import { RequestContext } from "./request-context";
import { logger } from "./logger";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

export function withRequestContext<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = performance.now();
    const requestId = request.headers.get("x-request-id") || RequestContext.generateId();
    const ip = (request as unknown as { ip?: string }).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;
    const correlationId = request.headers.get("x-correlation-id") || requestId;
    const method = request.method;
    const path = request.nextUrl.pathname;

    logger.info("Request started", { method, path });

    let response: NextResponse;
    try {
      response = await RequestContext.run(
        { requestId, ip, userAgent, correlationId },
        () => handler(request, ...args)
      );
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);
      
      // Preservar código de estado HTTP si el error es de tipo ApiError
      const status = error instanceof ApiError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Error interno del servidor.";
      
      logger.error("Request failed", error, { method, path, durationMs, status });
      
      response = NextResponse.json(
        { success: false, message },
        { status }
      );
    }

    const durationMs = Math.round(performance.now() - startTime);
    logger.info("Request finished", {
      method,
      path,
      durationMs,
      status: response.status,
    });

    response.headers.set("x-request-id", requestId);
    return response;
  };
}
