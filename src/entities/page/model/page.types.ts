export interface Page {
	id: string;

	workspace_id: string;

	teamspace_id: string | null;

	parent_page_id: string | null;

	public_subdomain: string | null;

	title: string;

	slug: string | null;

	icon: string | null;

	cover_url: string | null;

	is_template: boolean;

	canEdit: boolean;

	created_by: string;

	createdAt: string;

	updatedAt: string;

	deletedAt: string | null;

	deletedBy: string | null;
}

export interface WorkspaceDatabase {
	id: string;

	pageId: string;

	name: string;

	/** Set only for databases in Trash. */
	deletedAt: string | null;
}

export interface CreatePageInput {
	workspace_id: string;

	teamspace_id?: string | null;

	parent_page_id?: string | null;

	title: string;
}

export interface UpdatePageInput {
	title?: string;
	slug?: string | null;
	icon?: string | null;
	cover_url?: string | null;
}

export type PagePreset =
	| "empty"
	| "getting-started"
	| "todo-list"
	| "journal"
	| "meeting-notes"
	| "project-overview"
	| "tasks"
	| "team-home"
	| "onboarding";

export interface PagePresetOption {
	key: PagePreset;
	title: string;
	icon: string;
}

export interface MovePageInput {
	parent_page_id: string | null;
	teamspace_id: string | null;
}
