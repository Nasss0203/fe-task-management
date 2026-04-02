import { WORKSPACE_KEY, WorkspaceDto } from "@/services/workspace/type";
import {
	createWorkspaceApi,
	findAllWorkspaceApi,
} from "@/services/workspace/workspace.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWorkspace = () => {
	const queryClient = useQueryClient();
	const createWorkspace = useMutation({
		mutationFn: async (data: WorkspaceDto) => {
			const result = await createWorkspaceApi(data);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_KEY.WORKSPACE],
			});
		},
		onError: (err) => {
			console.error("createWorkspaceApi failed", err);
		},
	});

	const workspaceFindAll = useQuery({
		queryKey: [WORKSPACE_KEY.WORKSPACE],
		queryFn: findAllWorkspaceApi,
	});

	return {
		createWorkspace,
		workspaceFindAll,
	};
};
