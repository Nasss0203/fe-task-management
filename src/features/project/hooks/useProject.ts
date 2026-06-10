import {
	CreateProjectApi,
	deleteProjectApi,
	findProjectByWorkspaceIdApi,
	findDeletedProjectsApi,
	restoreProjectApi,
	updateProjectApi,
} from "@/services/project/project.service";
import { PROJECT_KEY, ProjectDto, UpdateProjectDto } from "@/services/project/type";
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

	const projects = useQuery({
		queryKey: [PROJECT_KEY.PROJECT, workspaceId],
		queryFn: () => findProjectByWorkspaceIdApi(workspaceId as string),
		enabled: !!workspaceId,
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

	const updateProject = useMutation({
		mutationFn: async (input: {
			workspaceId: string;
			projectId: string;
			data: UpdateProjectDto;
		}) => {
			const result = await updateProjectApi(input);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [PROJECT_KEY.PROJECT],
			});
		},
		onError: (err) => {
			console.error("updateProject failed", err);
		},
	});

	return { projects, createProject, deleteProject, deletedProjects, restoreProject, updateProject };
};
