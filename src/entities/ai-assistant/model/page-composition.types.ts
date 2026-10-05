export const PAGE_COMPOSITION_SCHEMA_VERSION = 1 as const;

export const PAGE_COMPOSITION_TYPE = "PAGE_COMPOSITION" as const;

export type PageCompositionBlockType =
	| "HEADER"
	| "TEXT"
	| "QUOTE"
	| "TODO"
	| "TOGGLE"
	| "DATABASE_VIEW";

export type PageCompositionPropertyType =
	| "TITLE"
	| "TEXT"
	| "NUMBER"
	| "SELECT"
	| "CHECKBOX"
	| "DATE";

export type PageCompositionViewType = "TABLE";

export interface PageCompositionPage {
	title: string;
	icon?: string | null;
	coverUrl?: string | null;
}

interface BasePageCompositionBlock {
	ref: string;
	parentRef?: string | null;
	orderIndex?: number;
}

export interface PageCompositionHeaderBlock extends BasePageCompositionBlock {
	type: "HEADER";

	content: {
		text: string;
	};

	styleConfig?: {
		level: number;
	};
}

export interface PageCompositionTextBlock extends BasePageCompositionBlock {
	type: "TEXT";

	content: {
		text: string;
	};
}

export interface PageCompositionQuoteBlock extends BasePageCompositionBlock {
	type: "QUOTE";

	content: {
		text: string;
	};
}

export interface PageCompositionTodoBlock extends BasePageCompositionBlock {
	type: "TODO";

	content: {
		text: string;
		checked: boolean;
	};
}

export interface PageCompositionToggleBlock extends BasePageCompositionBlock {
	type: "TOGGLE";

	content: {
		text: string;
	};
}

export interface PageCompositionDatabaseViewBlock extends BasePageCompositionBlock {
	type: "DATABASE_VIEW";

	databaseRef: string;
	viewRef: string;
}

export type PageCompositionBlock =
	| PageCompositionHeaderBlock
	| PageCompositionTextBlock
	| PageCompositionQuoteBlock
	| PageCompositionTodoBlock
	| PageCompositionToggleBlock
	| PageCompositionDatabaseViewBlock;

interface BasePageCompositionProperty {
	ref: string;
	name: string;
}

export interface PageCompositionTitleProperty extends BasePageCompositionProperty {
	type: "TITLE";
}

export interface PageCompositionTextProperty extends BasePageCompositionProperty {
	type: "TEXT";
}

export interface PageCompositionNumberProperty extends BasePageCompositionProperty {
	type: "NUMBER";
}

export interface PageCompositionCheckboxProperty extends BasePageCompositionProperty {
	type: "CHECKBOX";
}

export interface PageCompositionDateProperty extends BasePageCompositionProperty {
	type: "DATE";
}

export interface PageCompositionSelectOption {
	ref: string;
	name: string;
	color?: string | null;
}

export interface PageCompositionSelectProperty extends BasePageCompositionProperty {
	type: "SELECT";
	options: PageCompositionSelectOption[];
}

export type PageCompositionProperty =
	| PageCompositionTitleProperty
	| PageCompositionTextProperty
	| PageCompositionNumberProperty
	| PageCompositionSelectProperty
	| PageCompositionCheckboxProperty
	| PageCompositionDateProperty;

export interface PageCompositionDatabaseView {
	ref: string;
	name: string;
	type: PageCompositionViewType;
}

export interface PageCompositionSelectValue {
	optionRef: string;
}

export interface PageCompositionDateValue {
	start: string;
	end?: string | null;
}

export type PageCompositionRowValue =
	| string
	| number
	| boolean
	| null
	| PageCompositionSelectValue
	| PageCompositionDateValue;

export interface PageCompositionDatabaseRow {
	ref?: string;
	values: Record<string, PageCompositionRowValue>;
}

export interface PageCompositionDatabase {
	ref: string;
	name: string;

	properties: PageCompositionProperty[];

	views: PageCompositionDatabaseView[];

	rows: PageCompositionDatabaseRow[];
}

export interface PageCompositionDraft {
	schemaVersion: typeof PAGE_COMPOSITION_SCHEMA_VERSION;
	type: typeof PAGE_COMPOSITION_TYPE;

	page: PageCompositionPage;

	blocks: PageCompositionBlock[];

	databases: PageCompositionDatabase[];
}
