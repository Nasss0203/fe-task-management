export type ActivityEntityType =
	| "PAGE"
	| "PAGE_BLOCK"
	| "DATABASE"
	| "DATABASE_ROW"
	| "COMMENT"
	| "ATTACHMENT"
	| "WORKSPACE"
	| "TEAMSPACE"
	| "PROJECT"
	| "TASK"
	| "SPRINT";

export interface ActivityActor {
	id: string;
	username: string | null;
	email?: string | null;
}

export interface ActivityItem {
	id: string;
	workspaceId: string;
	pageId: string | null;
	entityType: ActivityEntityType;
	entityId: string;
	actorId: string | null;
	actor?: ActivityActor | null;
	action: string;
	field: string | null;
	metadata: Record<string, unknown> | null;
	isSystem: boolean;
	createdAt: string;
}

export interface ActivityPage {
	items: ActivityItem[];
	nextCursor: string | null;
}
