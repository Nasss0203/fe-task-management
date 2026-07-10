"use client";

import {
	FindAllWorkspaceResponse,
	WORKSPACE_KEY,
	WorkspaceDto,
} from "@/services/workspace/type";
import {
	createWorkspaceApi,
	findDeletedWorkspacesApi,
	findAllWorkspaceApi,
	restoreWorkspaceApi,
	softDeleteWorkspaceApi,
	updateWorkspaceApi,
	updateWorkspaceLayoutModeApi,
	removeWorkspaceFromUserTrashApi,
} from "@/services/workspace/workspace.service";
import { ADMIN_DASHBOARD_KEY } from "@/features/admin/modules/dashboard/hooks/useAdminDashboard";
import { ADMIN_WORKSPACES_KEY } from "@/features/admin/modules/workspaces/hooks/useAdminWorkspaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useProjectSelectionStore } from "@/stores/use-project-selection";

export const useWorkspace = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	const invalidateWorkspaceCaches = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: [WORKSPACE_KEY.WORKSPACE],
			}),
			queryClient.invalidateQueries({
				queryKey: [WORKSPACE_KEY.WORKSPACE_TRASH],
			}),
			queryClient.invalidateQueries({
				queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST],
			}),
			queryClient.invalidateQueries({
				queryKey: [ADMIN_DASHBOARD_KEY.ALL_WORKSPACES],
			}),
		]);
	};

	const createWorkspace = useMutation({
		mutationFn: async (data: WorkspaceDto) => {
			const result = await createWorkspaceApi(data);

			return result;
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_KEY.WORKSPACE],
			});

			const workspace = data.data ?? data;

			if (workspace.id) {
				useProjectSelectionStore.getState().setCurrentWorkspaceId(workspace.id);
			}

			if (workspace.slug) {
				router.push(`/dashboard/${workspace.slug}`);
			}
		},
		onError: (err) => {
			console.error("createWorkspaceApi failed", err);
		},
	});

	const workspaceFindAll = useQuery({
		queryKey: [WORKSPACE_KEY.WORKSPACE],
		queryFn: findAllWorkspaceApi,
	});

	const updateWorkspaceLayoutMode = useMutation({
		mutationFn: updateWorkspaceLayoutModeApi,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_KEY.WORKSPACE],
			});
		},
		onError: (err) => {
			console.error("updateWorkspaceLayoutModeApi failed", err);
		},
	});

	const updateWorkspace = useMutation({
		mutationFn: updateWorkspaceApi,
		onSuccess: async (response) => {
			const updatedWorkspace = response.data;

			queryClient.setQueryData<FindAllWorkspaceResponse>(
				[WORKSPACE_KEY.WORKSPACE],
				(previous) => {
					if (!previous) return previous;

					return {
						...previous,
						data: previous.data.map((workspace) =>
							workspace.id === updatedWorkspace.id
								? {
										...workspace,
										...updatedWorkspace,
									}
								: workspace,
						),
					};
				},
			);

			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_KEY.WORKSPACE],
			});
		},
		onError: (err) => {
			console.error("updateWorkspaceApi failed", err);
		},
	});

	const workspaceTrash = useQuery({
		queryKey: [WORKSPACE_KEY.WORKSPACE_TRASH],
		queryFn: findDeletedWorkspacesApi,
	});

	const softDeleteWorkspace = useMutation({
		mutationFn: softDeleteWorkspaceApi,
		onSuccess: async () => {
			await invalidateWorkspaceCaches();
		},
		onError: (err) => {
			console.error("softDeleteWorkspaceApi failed", err);
		},
	});

	const restoreWorkspace = useMutation({
		mutationFn: restoreWorkspaceApi,
		onSuccess: async () => {
			await invalidateWorkspaceCaches();
		},
		onError: (err) => {
			console.error("restoreWorkspaceApi failed", err);
		},
	});

	const removeWorkspaceFromUserTrash = useMutation({
		mutationFn: removeWorkspaceFromUserTrashApi,
		onSuccess: async () => {
			await invalidateWorkspaceCaches();
		},
		onError: (err) => {
			console.error("removeWorkspaceFromUserTrashApi failed", err);
		},
	});

	return {
		createWorkspace,
		workspaceFindAll,
		updateWorkspace,
		updateWorkspaceLayoutMode,
		workspaceTrash,
		softDeleteWorkspace,
		restoreWorkspace,
		removeWorkspaceFromUserTrash,
	};
};
