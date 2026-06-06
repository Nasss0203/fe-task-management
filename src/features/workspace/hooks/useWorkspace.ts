"use client";

import { WORKSPACE_KEY, WorkspaceDto } from "@/services/workspace/type";
import {
	createWorkspaceApi,
	findDeletedWorkspacesApi,
	findAllWorkspaceApi,
	restoreWorkspaceApi,
	softDeleteWorkspaceApi,
	updateWorkspaceLayoutModeApi,
} from "@/services/workspace/workspace.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useWorkspace = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
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

	const workspaceTrash = useQuery({
		queryKey: [WORKSPACE_KEY.WORKSPACE_TRASH],
		queryFn: findDeletedWorkspacesApi,
	});

	const softDeleteWorkspace = useMutation({
		mutationFn: softDeleteWorkspaceApi,
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE],
				}),
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE_TRASH],
				}),
			]);
		},
		onError: (err) => {
			console.error("softDeleteWorkspaceApi failed", err);
		},
	});

	const restoreWorkspace = useMutation({
		mutationFn: restoreWorkspaceApi,
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE],
				}),
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE_TRASH],
				}),
			]);
		},
		onError: (err) => {
			console.error("restoreWorkspaceApi failed", err);
		},
	});

	return {
		createWorkspace,
		workspaceFindAll,
		updateWorkspaceLayoutMode,
		workspaceTrash,
		softDeleteWorkspace,
		restoreWorkspace,
	};
};
