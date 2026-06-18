import { AuditEntry } from "./types";
import { PrismaAuditLogger } from "./prisma-audit-logger";

export interface AuditLogger {
  log(entry: Readonly<AuditEntry>): Promise<void>;
}

let activeLogger: AuditLogger | undefined;

export function getAuditLogger(): AuditLogger {
  if (!activeLogger) {
    activeLogger = new PrismaAuditLogger();
  }
  return activeLogger;
}

export function setAuditLogger(logger: AuditLogger): void {
  activeLogger = logger;
}

/**
 * Wraps a promise with a timeout limit.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, name: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Audit logger [${name}] timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Composite logger that dispatches logs in parallel using Promise.allSettled.
 * Each logger destination is isolated with its own timeout so one slow logger does not block others.
 */
export class CompositeAuditLogger implements AuditLogger {
  constructor(
    private readonly loggers: readonly AuditLogger[],
    private readonly timeoutMs: number = 5000
  ) {}

  async log(entry: Readonly<AuditEntry>): Promise<void> {
    await Promise.allSettled(
      this.loggers.map(logger => {
        const loggerName = logger.constructor.name || "UnknownLogger";
        return withTimeout(logger.log(entry), this.timeoutMs, loggerName).catch(err => {
          console.error(`Audit destination [${loggerName}] failed: ${err.message || String(err)}`);
          throw err;
        });
      })
    );
  }
}
