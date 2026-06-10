export type TemplateItem = {
	id: number;
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

export const templateItems: TemplateItem[] = [
	{
		id: 1,
		title: "Project Kick-Off Template",
		description:
			"This comprehensive template covers key elements from goal setting to task allocation, providing a structured foundation for project success.",
		variant: "kanban",
	},
	{
		id: 2,
		title: "Project Timeline Template",
		description:
			"Define objectives, break them down into actionable steps, and monitor your progress towards achieving your targets.",
		variant: "timeline",
	},
	{
		id: 3,
		title: "Team Meeting Agenda",
		description:
			"Structured to cover important discussion points, action items, and follow-ups, this template ensures your team stays focused and aligned.",
		variant: "mindmap",
	},
	{
		id: 4,
		title: "Daily Task Checklist",
		description:
			"Easily organize and prioritize your tasks for the day, ensuring nothing gets overlooked and maximizing your daily productivity.",
		variant: "checklist",
	},
	{
		id: 5,
		title: "Goal Setting Worksheet",
		description:
			"Define objectives, break them down into actionable steps, and monitor your progress towards achieving your targets.",
		variant: "timeline",
	},
	{
		id: 6,
		title: "Personal Productivity Planner",
		description:
			"Organize your tasks, set priorities, and track your accomplishments to maximize efficiency in your day-to-day activities.",
		variant: "planner",
	},
];
