import { WorkspaceDto } from "@/services/workspace/type";
import { createWorkspaceApi } from "@/services/workspace/workspace.service";
import { useMutation } from "@tanstack/react-query";

export const useWorkspace = () => {
	return useMutation({
		mutationFn: async (data: WorkspaceDto) => {
			const result = await createWorkspaceApi(data);

			return result;
		},
		onSuccess: async () => {},
		onError: (err) => {
			console.error("login failed", err);
		},
	});
};
