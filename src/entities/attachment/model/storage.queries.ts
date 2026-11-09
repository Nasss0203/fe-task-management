"use client";

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { attachmentApi } from "../api/attachment-api";
import type { ListStorageFilesParams } from "./attachment.types";

export const storageKeys = {
	all: (workspaceId: string) => ["workspace-storage", workspaceId] as const,
	usage: (workspaceId: string) =>
		[...storageKeys.all(workspaceId), "usage"] as const,
	files: (workspaceId: string, params: ListStorageFilesParams) =>
		[...storageKeys.all(workspaceId), "files", params] as const,
};

export function useWorkspaceStorage(workspaceId: string) {
	return useQuery({
		queryKey: storageKeys.usage(workspaceId),
		queryFn: ({ signal }) =>
			attachmentApi.getWorkspaceStorage(workspaceId, signal),
		enabled: Boolean(workspaceId),
	});
}

export function useWorkspaceStorageFiles(
	workspaceId: string,
	params: ListStorageFilesParams,
) {
	return useQuery({
		queryKey: storageKeys.files(workspaceId, params),
		queryFn: ({ signal }) =>
			attachmentApi.listWorkspaceFiles(workspaceId, params, signal),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	});
}

export function useBulkDeleteWorkspaceFiles(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ids: string[]) =>
			attachmentApi.bulkDeleteWorkspaceFiles(workspaceId, ids),
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: storageKeys.all(workspaceId),
			}),
	});
}
