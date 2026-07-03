import { BoardViewType } from "../board/type";

export enum PROJECT_KEY {
	PROJECT = "project",
	PROJECT_TRASH = "project-trash",
}
export enum ProjectVisibility {
	PRIVATE = "PRIVATE",
	INTERNAL = "INTERNAL",
}

export interface ProjectItems {
	created_at?: string;
	created_by?: string;
	deleted_at?: string | null;
	deleted_by?: string | null;
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

export interface FindDeletedProjectResponse {
	data: ProjectItems[];
}

export interface ProjectDto {
	workspace_id: string;
	name: string;
	visibility?: ProjectVisibility;
	create_default_board?: boolean;
	default_board_view_type?: BoardViewType;
}

export interface CreateProjectResponse {
	data: ProjectItems;
}

export interface DeleteProjectResponse {
	success: boolean;
}

export type UpdateProjectDto = {
	name?: string;
};

export interface UpdateProjectResponse {
	data: ProjectItems;
}
