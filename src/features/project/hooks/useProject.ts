import {
	CreateProjectApi,
	deleteProjectApi,
	findProjectByWorkspaceIdApi,
	findDeletedProjectsApi,
	restoreProjectApi,
	updateProjectApi,
} from "@/services/project/project.service";
import {
	FindAllProjectResponse,
	PROJECT_KEY,
	ProjectDto,
	UpdateProjectDto,
} from "@/services/project/type";
import { WORKSPACE_OVERVIEW_KEY } from "@/features/workspace/hooks/useWorkspaceOverview";
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
			if (process.env.NODE_ENV === "development") {
				console.info("createProject failed", err);
			}
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
		onSuccess: async (response, variables) => {
			const updatedProject = response.data;

			queryClient.setQueryData<FindAllProjectResponse>(
				[PROJECT_KEY.PROJECT, variables.workspaceId],
				(previous) => {
					if (!previous) return previous;

					return {
						...previous,
						data: previous.data.map((project) =>
							project.id === variables.projectId
								? {
										...project,
										...updatedProject,
									}
								: project,
						),
					};
				},
			);

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [PROJECT_KEY.PROJECT],
				}),
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_OVERVIEW_KEY, variables.workspaceId],
				}),
			]);
		},
		onError: (err) => {
			console.error("updateProject failed", err);
		},
	});

	return { projects, createProject, deleteProject, deletedProjects, restoreProject, updateProject };
};
