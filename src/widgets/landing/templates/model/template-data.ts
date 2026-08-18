export type TemplateItem = {
	id: string | number;
	title: string;
	description: string;
	variant:
		| "kanban"
		| "mindmap"
		| "checklist"
		| "timeline"
		| "planner"
		| "meeting";
};
