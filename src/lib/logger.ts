type LogContext = Record<string, unknown>;

const environment = process.env.NODE_ENV || "development";
const service = "syntek-web";

type RequestIdResolver = () => string | undefined;
let requestIdResolver: RequestIdResolver = () => undefined;

export const logger = {
  setRequestIdResolver: (resolver: RequestIdResolver) => {
    requestIdResolver = resolver;
  },

  info: (message: string, context?: LogContext) => {
    const requestId = requestIdResolver();
    console.info(
      JSON.stringify({
        level: "info",
        service,
        environment,
        timestamp: new Date().toISOString(),
        requestId,
        message,
        ...context,
      })
    );
  },

  warn: (message: string, context?: LogContext) => {
    const requestId = requestIdResolver();
    console.warn(
      JSON.stringify({
        level: "warn",
        service,
        environment,
        timestamp: new Date().toISOString(),
        requestId,
        message,
        ...context,
      })
    );
  },

  error: (message: string, error?: unknown, context?: LogContext) => {
    const requestId = requestIdResolver();
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error(
      JSON.stringify({
        level: "error",
        service,
        environment,
        timestamp: new Date().toISOString(),
        requestId,
        message,
        error: errMsg,
        stack: errStack,
        ...context,
      })
    );
  },
};
