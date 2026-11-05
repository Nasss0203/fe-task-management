export enum DatabaseViewType {
	TABLE = "TABLE",
	BOARD = "BOARD",
	CALENDAR = "CALENDAR",
	LIST = "LIST",
}

export enum PropertyType {
	TITLE = "TITLE",
	TEXT = "TEXT",
	NUMBER = "NUMBER",
	SELECT = "SELECT",
	MULTI_SELECT = "MULTI_SELECT",
	STATUS = "STATUS",
	DATE = "DATE",
	CHECKBOX = "CHECKBOX",
	PERSON = "PERSON",
	URL = "URL",
	EMAIL = "EMAIL",
	PHONE = "PHONE",
	FILE = "FILE",
	CREATED_TIME = "CREATED_TIME",
	UPDATED_TIME = "UPDATED_TIME",
	CREATED_BY = "CREATED_BY",
}

export interface PropertyOption {
	id: string;
	name: string;
	color: string | null;
	position: string;
}

export interface DatabaseProperty {
	id: string;
	databaseId?: string;
	name: string;
	type: PropertyType;
	isDefault: boolean;
	isHideable: boolean;
	position: string;
	options: PropertyOption[];
}

export interface Database {
	id: string;
	pageId: string;
	name: string;
	properties: DatabaseProperty[];
}

/** What a form exposes to the people filling it: only its questions' columns. */
export interface FormDatabase {
	id: string;
	properties: Omit<DatabaseProperty, "isDefault" | "isHideable">[];
}

export interface DatabaseView {
	id: string;
	databaseId: string;
	name: string;
	type: DatabaseViewType;
	position: string;
}

export interface DatabaseViewProperty {
	id: string;
	propertyId: string;
	position: string;
	visible: boolean;
	width: number | null;
}

export type DatabaseViewSortDirection = "asc" | "desc";

export interface DatabaseViewSort {
	propertyId: string;
	direction: DatabaseViewSortDirection;
}

export interface DatabaseViewFilter {
	propertyId: string;
	operator: string;
	value?: string | number | null;
}

export interface DatabaseViewDetail extends DatabaseView {
	properties: DatabaseViewProperty[];
	sorts?: DatabaseViewSort[];
	filters?: DatabaseViewFilter[];
	groupBy?: string | null;
}

export interface DatabaseRowValue {
	id: string;
	propertyId: string;
	value: unknown;
}

export interface DatabaseRow {
	id: string;
	databaseId: string;
	position?: number;
	/** Set on a sub-task; null or missing for a top-level row. */
	parentRowId?: string | null;
	values: DatabaseRowValue[];
}

/** A user referenced by a Person cell, readable by anyone who can read the rows. */
export interface DatabasePerson {
	user_id: string;
	full_name: string;
	avatar_url: string | null;
}

export interface CalendarFeed {
	token: string;
	datePropertyId: string;
}

export type GoogleCalendarSyncError =
	| "ACCESS_REVOKED"
	| "ACCESS_LOST"
	| "DATE_PROPERTY_MISSING"
	| "CALENDAR_MISSING"
	| "GOOGLE_ERROR";

export interface GoogleCalendarSyncStatus {
	connected: boolean;
	googleEmail: string | null;
	connectionError: GoogleCalendarSyncError | null;
	sync: {
		datePropertyId: string;
		assignedToMeOnly: boolean;
		lastSyncedAt: string | null;
		lastError: GoogleCalendarSyncError | null;
	} | null;
}

export interface SetDatabaseRowValueResponse {
	id: string;
	rowId: string;
	propertyId: string;
	value: unknown;
}
