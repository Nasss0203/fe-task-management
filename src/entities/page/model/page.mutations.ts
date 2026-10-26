"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pageApi } from "../api/page.api";
import { pageKeys } from "./page.queries";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { pagePublicationKeys } from "@/entities/page-publication/model/page-publication.queries";
import type {
	CreatePageInput,
	MovePageInput,
	PagePreset,
	UpdatePageInput,
	Page,
} from "./page.types";

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

				queryClient.invalidateQueries({
					queryKey: pageKeys.favorites(variables.workspaceId),
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

				queryClient.invalidateQueries({
					queryKey: pageKeys.favorites(variables.workspaceId),
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
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageKeys.trash(variables.workspaceId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageKeys.favorites(variables.workspaceId),
				}),
			]);
		},
	});
}

interface TrashedDatabaseInput {
	pageId: string;
	databaseId: string;
	workspaceId: string;
}

export function useRestoreDatabase() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, databaseId }: TrashedDatabaseInput) =>
			pageApi.restoreDatabase(pageId, databaseId),

		onSuccess: async (_, variables) => {
			await Promise.all([
				// Prefix also covers the Trash list.
				queryClient.invalidateQueries({
					queryKey: pageKeys.databases(variables.workspaceId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageBlockKeys.byPage(variables.pageId),
				}),
			]);
		},
	});
}

export function useDeleteDatabasePermanently() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, databaseId }: TrashedDatabaseInput) =>
			pageApi.deleteDatabasePermanently(pageId, databaseId),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: pageKeys.deletedDatabases(variables.workspaceId),
			});
		},
	});
}

interface TogglePageFavoriteInput {
	page: Page;
	isFavorite: boolean;
}

export function useTogglePageFavorite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ page, isFavorite }: TogglePageFavoriteInput) => {
			if (isFavorite) {
				await pageApi.removeFavorite(page.id);
				return;
			}

			await pageApi.addFavorite(page.id);
		},

		onMutate: async ({ page, isFavorite }) => {
			const queryKey = pageKeys.favorites(page.workspace_id);

			await queryClient.cancelQueries({ queryKey });

			const previousFavorites = queryClient.getQueryData<Page[]>(queryKey);

			queryClient.setQueryData<Page[]>(queryKey, (favorites = []) =>
				isFavorite
					? favorites.filter((favorite) => favorite.id !== page.id)
					: [page, ...favorites.filter((favorite) => favorite.id !== page.id)],
			);

			return { previousFavorites };
		},

		onError: (_error, { page }, context) => {
			queryClient.setQueryData(
				pageKeys.favorites(page.workspace_id),
				context?.previousFavorites,
			);
		},

		onSettled: async (_data, _error, { page }) => {
			await queryClient.invalidateQueries({
				queryKey: pageKeys.favorites(page.workspace_id),
			});
		},
	});
}

export function useMovePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			pageId,
			workspaceId,
			input,
		}: {
			pageId: string;
			workspaceId: string;
			input: MovePageInput;
		}) => pageApi.move(pageId, workspaceId, input),

		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageKeys.byWorkspace(variables.workspaceId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageKeys.detail(variables.pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.all,
				}),
			]);
		},
	});
}

export function useDuplicatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			pageId,
			workspaceId,
		}: {
			pageId: string;
			workspaceId: string;
		}) => pageApi.duplicate(pageId, workspaceId),

		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: pageKeys.byWorkspace(variables.workspaceId),
			});
		},
	});
}

export function useApplyPagePreset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ pageId, preset }: { pageId: string; preset: PagePreset }) =>
			pageApi.applyPreset(pageId, preset),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});
		},
	});
}
