"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/features/auth/model/use-user";

import { workspaceApi } from "../api/workspace.api";
import { workspaceKeys } from "./workspace.queries";
import type { CreateWorkspaceInput } from "./workspace.types";

export function useSelectWorkspace() {
	const { user, setUser } = useUser();

	return useMutation({
		mutationFn: (workspaceId: string) => workspaceApi.select(workspaceId),

		onSuccess: ({ workspaceId }) => {
			if (!user) return;
			setUser({
				...user,
				lastActiveWorkspaceId: workspaceId,
			});
		},
	});
}

export function useCreateWorkspace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateWorkspaceInput) => workspaceApi.create(input),

		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all }),
	});
}

export function useUpdateWorkspace(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { name?: string; icon?: string | null }) =>
			workspaceApi.update(workspaceId, input),

		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all }),
	});
}

export function useMoveWorkspaceToTrash() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (workspaceId: string) => workspaceApi.moveToTrash(workspaceId),

		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all }),
	});
}
