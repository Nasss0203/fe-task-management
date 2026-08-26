"use client";

import { useMutation } from "@tanstack/react-query";

import { useUser } from "@/features/auth/model/use-user";

import { workspaceApi } from "../api/workspace.api";

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
