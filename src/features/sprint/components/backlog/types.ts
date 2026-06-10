export type BacklogRenderContext = "project" | "workspace";

export type TaskItem = {
	id: string;
	code: string;
	title: string;
	status: string;
	priority: string;
	assigneeName?: string;
	assigneeAvatar?: string;
	sprintId?: string | null;
	sprintName?: string | null;
};
