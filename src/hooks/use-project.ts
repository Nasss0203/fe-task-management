import { CreateProjectApi } from "@/services/project/project.service";
import { PROJECT_KEY, ProjectDto } from "@/services/project/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useProject = () => {
	const queryClient = useQueryClient();
	const createProject = useMutation({
		mutationFn: async (data: ProjectDto) => {
			const result = await CreateProjectApi(data);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [PROJECT_KEY.PROJECT],
			});
		},
		onError: (err) => {
			console.error("createWorkspaceApi failed", err);
		},
	});

	return { createProject };
};
