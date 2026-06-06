import {
	CreateProjectApi,
	deleteProjectApi,
	findDeletedProjectsApi,
	restoreProjectApi,
} from "@/services/project/project.service";
import { PROJECT_KEY, ProjectDto } from "@/services/project/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProject = (workspaceId?: string) => {
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
			console.error("createProject failed", err);
		},
	});

	const deleteProject = useMutation({
		mutationFn: async (input: {
			workspaceId: string;
			projectId: string;
		}) => {
			const result = await deleteProjectApi(input);

			return result;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [PROJECT_KEY.PROJECT],
				}),
				queryClient.invalidateQueries({
					queryKey: [PROJECT_KEY.PROJECT_TRASH],
				}),
			]);
		},
		onError: (err) => {
			console.error("deleteProject failed", err);
		},
	});

	const deletedProjects = useQuery({
		queryKey: [PROJECT_KEY.PROJECT_TRASH, workspaceId],
		queryFn: () => findDeletedProjectsApi(workspaceId as string),
		enabled: !!workspaceId,
	});

	const restoreProject = useMutation({
		mutationFn: async (input: {
			workspaceId: string;
			projectId: string;
		}) => {
			const result = await restoreProjectApi(input);

			return result;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [PROJECT_KEY.PROJECT],
				}),
				queryClient.invalidateQueries({
					queryKey: [PROJECT_KEY.PROJECT_TRASH],
				}),
			]);
		},
		onError: (err) => {
			console.error("restoreProject failed", err);
		},
	});

	return { createProject, deleteProject, deletedProjects, restoreProject };
};
