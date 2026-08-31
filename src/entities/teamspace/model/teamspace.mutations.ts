import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teamspaceApi } from "../api/teamspace.api";
import { teamspaceKeys } from "./teamspace.queries";

import type { CreateTeamspaceInput } from "./teamspace.types";

export function useCreateTeamspace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTeamspaceInput) => teamspaceApi.create(input),

		onSuccess: (teamspace) => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.workspace(teamspace.workspaceId),
			});
		},
	});
}
