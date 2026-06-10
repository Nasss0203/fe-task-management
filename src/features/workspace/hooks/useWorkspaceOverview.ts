import { useQuery } from "@tanstack/react-query";
import { getWorkspaceOverviewApi } from "@/services/workspace/overview.service";
import type { WorkspaceOverviewApiData } from "@/features/workspace/components/workspaces/workspace-overview/workspace-overview.types";

export const WORKSPACE_OVERVIEW_KEY = "workspace-overview";

export const useWorkspaceOverview = (workspaceId: string | null) => {
  return useQuery<WorkspaceOverviewApiData>({
    queryKey: [WORKSPACE_OVERVIEW_KEY, workspaceId],
    queryFn: () => getWorkspaceOverviewApi(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
};
