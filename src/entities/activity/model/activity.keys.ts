export const activityKeys = {
	all: ["activity"] as const,

	page: (pageId: string) => [...activityKeys.all, "page", pageId] as const,

	pageSummary: (pageId: string) =>
		[...activityKeys.page(pageId), "summary"] as const,
};
