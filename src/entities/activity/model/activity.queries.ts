import { useInfiniteQuery } from "@tanstack/react-query";

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
