import { findSprint } from "@/services/sprint/sprint.service";
import { SPRINT_KEY, SprintParams } from "@/services/sprint/type";
import { useQuery } from "@tanstack/react-query";

export function useSprints(input: SprintParams) {
	const findSprintDetail = useQuery({
		queryKey: [
			SPRINT_KEY.SPRINTS,
			input.workspaceId,
			input.projectId,
			input.sprintId,
		],
		queryFn: () => findSprint.findSprintDetail(input),
		enabled: Boolean(
			input.workspaceId && input.projectId && input.sprintId,
		),
	});

	return {
		findSprintDetail,
		sprint: findSprintDetail.data,
		isLoading: findSprintDetail.isLoading,
		isError: findSprintDetail.isError,
		error: findSprintDetail.error,
		refetch: findSprintDetail.refetch,
	};
}
