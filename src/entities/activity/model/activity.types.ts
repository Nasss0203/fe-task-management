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

export interface ActivityOptionTarget {
	id: string;
	name: string;
	color: string | null;
}

export interface ActivityTarget {
	rowTitle: string | null;
	propertyName: string | null;
	propertyType: string | null;
	options: ActivityOptionTarget[];
	people: { id: string; username: string | null }[];
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
	newValue?: unknown;
	target?: ActivityTarget | null;
	metadata: Record<string, unknown> | null;
	isSystem: boolean;
	createdAt: string;
}

export interface ActivityMoment {
	actor: ActivityActor | null;
	at: string;
}

export interface PageActivitySummary {
	lastEdited: ActivityMoment | null;
	created: ActivityMoment | null;
}

export interface ActivityPage {
	items: ActivityItem[];
	nextCursor: string | null;
}
