import { Permission } from "@/auth/permissions";
import { DomainUser } from "@/auth/types";
import { AuditOperation } from "@/generated/prisma";

export { AuditOperation };

export const ResourceType = {
  PRODUCT: "product",
  ORDER: "order",
  CUSTOMER: "customer",
  CONTACT: "contact",
  USER: "user",
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export const AuditAction = {
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",
  ORDER_CREATE: "order.create",
  ORDER_UPDATE: "order.update",
  ORDER_CANCEL: "order.cancel",
  CUSTOMER_CREATE: "customer.create",
  CUSTOMER_UPDATE: "customer.update",
  CUSTOMER_DELETE: "customer.delete",
  CONTACT_CREATE: "contact.create",
  CONTACT_UPDATE: "contact.update",
  CONTACT_DELETE: "contact.delete",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_PERMISSION_DENIED: "user.permission_denied",
  ADMIN_ACCESS: "admin.access",
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

// Bootstrap Assertions & Freezing
function assertUniqueValues(obj: Record<string, string>, name: string): void {
  const values = Object.values(obj);
  const uniqueValues = new Set(values);
  if (values.length !== uniqueValues.size) {
    throw new Error(`Bootstrap assertion failed: Duplicate values found in ${name}`);
  }
}

assertUniqueValues(ResourceType, "ResourceType");
assertUniqueValues(AuditAction, "AuditAction");

Object.freeze(ResourceType);
Object.freeze(AuditAction);

export const AuditActionSet = new Set<string>(Object.values(AuditAction));
export const AuditOperationSet = new Set<string>(Object.values(AuditOperation));

export const AUDIT_SCHEMA_VERSION = 1 as const;
export type AuditSchemaVersion = typeof AUDIT_SCHEMA_VERSION;

export type AuditResult = "SUCCESS" | "FAILURE" | "DENIED";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: JsonValue }
  | readonly JsonValue[];

export type AuditMetadata = Readonly<Record<string, JsonValue>>;

export interface AuditActor {
  readonly id: string;
  readonly email: string;
  readonly role: string;
}

export interface AuditResource {
  readonly type: ResourceType;
  readonly id?: string;
}

export interface AuditEntry {
  readonly action: AuditAction;
  readonly operation: AuditOperation;
  readonly actor?: Readonly<AuditActor>;
  readonly organizationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly resource: Readonly<AuditResource>;
  readonly result: AuditResult;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly statusCode?: number;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly metadata?: AuditMetadata;
  readonly schemaVersion: AuditSchemaVersion;
  readonly durationMs?: number;
  readonly createdAt: Date;
}

export interface AuditMetadataContext<TArgs extends unknown[], TResult, TBefore, TAfter> {
  readonly args: TArgs;
  readonly result?: TResult;
  readonly error?: unknown;
  readonly beforeState?: TBefore;
  readonly afterState?: TAfter;
}

export interface AuditedActionConfig<TArgs extends unknown[], TResult, TBefore = unknown, TAfter = unknown> {
  readonly action: AuditAction | ((args: TArgs, result?: TResult, error?: unknown) => AuditAction);
  readonly operation: AuditOperation;
  readonly resourceType: ResourceType;
  readonly permissions?: readonly Permission[];
  readonly permissionStrategy?: "all" | "any";
  readonly getResourceId: (args: TArgs, result?: TResult) => Promise<string | undefined> | string | undefined;
  readonly captureBeforeState?: (args: TArgs) => Promise<TBefore> | TBefore;
  readonly captureAfterState?: (args: TArgs, result?: TResult, error?: unknown) => Promise<TAfter> | TAfter;
  readonly shouldAudit?: (context: AuditMetadataContext<TArgs, TResult, TBefore, TAfter>) => boolean;
  readonly getMetadata?: (context: AuditMetadataContext<TArgs, TResult, TBefore, TAfter>) => Promise<Record<string, unknown> | undefined> | Record<string, unknown> | undefined;
  readonly handler: (context: { user: DomainUser | null; requestId: string }, ...args: TArgs) => Promise<TResult>;
}

export interface Clock {
  now(): Date;
}

let activeClock: Clock = {
  now: () => new Date(),
};

export const AuditClock = {
  now(): Date {
    return activeClock.now();
  },
};

export function setAuditClock(clock: Clock): void {
  activeClock = clock;
}
