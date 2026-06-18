import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "crypto";
import { logger } from "./logger";

export interface RequestContextStore {
  requestId: string;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  traceId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextStore>();

export const RequestContext = {
  run<T>(store: RequestContextStore, fn: () => T): T {
    return asyncLocalStorage.run(store, fn);
  },

  getRequestId(): string | undefined {
    return asyncLocalStorage.getStore()?.requestId;
  },

  getIp(): string | undefined {
    return asyncLocalStorage.getStore()?.ip;
  },

  getUserAgent(): string | undefined {
    return asyncLocalStorage.getStore()?.userAgent;
  },

  getCorrelationId(): string | undefined {
    return asyncLocalStorage.getStore()?.correlationId;
  },

  getTraceId(): string | undefined {
    return asyncLocalStorage.getStore()?.traceId;
  },

  generateId(): string {
    return crypto.randomUUID();
  }
};

// Register the resolver on the logger!
logger.setRequestIdResolver(() => RequestContext.getRequestId());
