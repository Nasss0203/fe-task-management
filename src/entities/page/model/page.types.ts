export interface Page {
	id: string;
	workspace_id: string;
	title: string;
	slug: string | null;
	icon: string | null;
	cover_url: string | null;
	is_template: boolean;
	created_by: string;

	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	deletedBy: string | null;
}
