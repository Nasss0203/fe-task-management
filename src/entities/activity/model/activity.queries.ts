import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { activityApi } from "../api/activity.api";
import { activityKeys } from "./activity.keys";

export function usePageActivities(
	workspaceId: string | undefined,
	pageId: string,
	enabled = true,
) {
	return useInfiniteQuery({
		queryKey: activityKeys.page(pageId),

		queryFn: ({ pageParam }) =>
			activityApi.getPageActivities(
				workspaceId as string,
				pageId,
				pageParam ?? undefined,
			),

		initialPageParam: null as string | null,

		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

		enabled: enabled && Boolean(workspaceId),
	});
}

export function usePageActivitySummary(
	workspaceId: string | undefined,
	pageId: string,
	enabled = true,
) {
	return useQuery({
		queryKey: activityKeys.pageSummary(pageId),
		queryFn: () =>
			activityApi.getPageActivitySummary(workspaceId as string, pageId),
		enabled: enabled && Boolean(workspaceId),
	});
}
