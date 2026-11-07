export const activityKeys = {
	all: ["activity"] as const,

	page: (pageId: string) => [...activityKeys.all, "page", pageId] as const,
};
