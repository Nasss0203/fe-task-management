import { useQuery } from "@tanstack/react-query";

import { workspaceMemberApi } from "../api/workspace-member.api";

export const workspaceMemberKeys = {
	all: ["workspace-members"] as const,

	people: (workspaceId: string) =>
		[...workspaceMemberKeys.all, "people", workspaceId] as const,
};

export function useWorkspacePeople(workspaceId: string, enabled = true) {
	return useQuery({
		queryKey: workspaceMemberKeys.people(workspaceId),

		queryFn: () => workspaceMemberApi.getPeople(workspaceId),

		enabled: Boolean(workspaceId) && enabled,
	});
}
