export enum BoardViewType {
	BOARD = "BOARD",
	TABLE = "TABLE",
	LIST = "LIST",
	CALENDAR = "CALENDAR",
	TIMELINE = "TIMELINE",
	GALLERY = "GALLERY",
	CHART = "CHART",
	DASHBOARD = "DASHBOARD",
	FORM = "FORM",
	MAP = "MAP",
	FEED = "FEED",
}

export type BoardItem = {
	id: string;
	name: string;
	viewType: BoardViewType;
	projectId: string;
	workspaceId: string;
};
