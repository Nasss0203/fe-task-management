"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pageApi } from "../api/page.api";
import { pageKeys } from "./page.queries";
import type { CreatePageInput, UpdatePageInput } from "./page.types";

export function useCreatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreatePageInput) => pageApi.create(input),

		onSuccess: async (page) => {
			await queryClient.invalidateQueries({
				queryKey: pageKeys.byWorkspace(page.workspace_id),
			});
		},
	});
}

interface UpdatePageMutationInput {
	pageId: string;
	workspaceId: string;
	input: UpdatePageInput;
}

export function useUpdatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, input }: UpdatePageMutationInput) =>
			pageApi.update(pageId, input),

		onSuccess: async (page, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageKeys.byWorkspace(variables.workspaceId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageKeys.detail(page.id),
				}),
			]);
		},
	});
}

interface MovePageToTrashInput {
	pageId: string;
	workspaceId: string;
}

export function useMovePageToTrash() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, workspaceId }: MovePageToTrashInput) =>
			pageApi.moveToTrash(pageId, workspaceId),

		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageKeys.byWorkspace(variables.workspaceId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageKeys.trash(variables.workspaceId),
				}),
			]);
		},
	});
}

interface RestorePageInput {
	pageId: string;
	workspaceId: string;
}

export function useRestorePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, workspaceId }: RestorePageInput) =>
			pageApi.restore(pageId, workspaceId),

		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageKeys.byWorkspace(variables.workspaceId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageKeys.trash(variables.workspaceId),
				}),
			]);
		},
	});
}

interface DeletePagePermanentlyInput {
	pageId: string;
	workspaceId: string;
}

export function useDeletePagePermanently() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, workspaceId }: DeletePagePermanentlyInput) =>
			pageApi.deletePermanently(pageId, workspaceId),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: pageKeys.trash(variables.workspaceId),
			});
		},
	});
}
