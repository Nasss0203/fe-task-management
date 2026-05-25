export const ASSIGN_QUERY_KEYS = {
	byTask: (taskId: string) => ["assignees", taskId] as const,
};
