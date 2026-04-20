export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AuditActionType =
	| "WORKSPACE_CREATED"
	| "WORKSPACE_DELETED"
	| "WORKSPACE_LOCKED"
	| "USER_LOCKED"
	| "USER_UNLOCKED"
	| "ROLE_CHANGED"
	| "BILLING_CHANGED"
	| "ADMIN_LOGIN";

export type AuditTargetType =
	| "WORKSPACE"
	| "USER"
	| "ROLE"
	| "BILLING"
	| "AUTH";

export type AuditBeforeAfter = Record<string, unknown> | null;

export type AdminAuditLog = {
	id: string;
	actorId: string;
	actorName: string;
	actorEmail: string;
	action: AuditActionType;
	targetType: AuditTargetType;
	targetId: string;
	targetName: string;
	severity: AuditSeverity;
	description: string;
	createdAt: string;
	ipAddress: string;
	userAgent: string;
	before: AuditBeforeAfter;
	after: AuditBeforeAfter;
};
