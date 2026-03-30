export enum PROJECT_KEY {
	PROJECT = "project",
}

export interface ProjectItems {
	created_at?: string;
	created_by?: string;
	id?: string;
	key?: string;
	name?: string;
	task_seq?: 0;
	updated_at?: string;
	visibility?: string;
	workspace_id?: string;
}

export interface FindAllProjectResponse {
	data: ProjectItems[];
}
