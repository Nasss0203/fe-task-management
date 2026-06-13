import { findActivitiesByEntityApi } from "@/services/activity/activity.service";
import { useQuery } from "@tanstack/react-query";

export function useTaskDetailActivities(
  workspaceId: string,
  taskId: string,
  enabled: boolean = true
) {
  const query = useQuery({
    queryKey: ["task-activities", workspaceId, taskId],
    queryFn: () =>
      findActivitiesByEntityApi({
        workspaceId,
        entityType: "TASK",
        entityId: taskId,
        limit: 100, // Fetch up to 100 activities for the drawer
      }),
    enabled: enabled && !!workspaceId && !!taskId,
  });

  return {
    activities: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
