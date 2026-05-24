"use client";

import { WORKSPACE_KEY, WorkspaceDto } from "@/services/workspace/type";
import {
	createWorkspaceApi,
	findAllWorkspaceApi,
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

	return {
		createWorkspace,
		workspaceFindAll,
	};
};
