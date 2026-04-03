import { BoardViewType } from "@/components/block/ProjectBlock";

export enum PROJECT_KEY {
	PROJECT = "project",
}
export enum ProjectVisibility {
	PRIVATE = "PRIVATE",
	INTERNAL = "INTERNAL",
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

export interface ProjectDto {
	workspace_id: string;
	name: string;
	key?: string;
	visibility?: ProjectVisibility;
	task_seq?: number;
	created_by?: string;
	create_default_board?: boolean;
	default_board_view_type?: BoardViewType;
}

export interface CreateProjectResponse {
	data: ProjectItems;
}
