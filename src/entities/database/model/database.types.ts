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
	position: string;
	options: PropertyOption[];
}

export interface Database {
	id: string;
	pageId: string;
	name: string;
	properties: DatabaseProperty[];
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

export interface DatabaseViewDetail extends DatabaseView {
	properties: DatabaseViewProperty[];
}

export interface DatabaseRowValue {
	id: string;
	propertyId: string;
	value: unknown;
}

export interface DatabaseRow {
	id: string;
	databaseId: string;
	values: DatabaseRowValue[];
}

export interface SetDatabaseRowValueResponse {
	id: string;
	rowId: string;
	propertyId: string;
	value: unknown;
}
