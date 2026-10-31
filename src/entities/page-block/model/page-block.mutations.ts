"use client";

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DatabaseViewType } from "@/entities/database/model/database.types";

import { databaseApi } from "@/entities/database/api/database.api";
import { pageBlockApi } from "@/entities/page-block/api/page-block.api";
import {
	PageBlockJson,
	PageBlockStyleConfig,
	PageBlockType,
} from "@/entities/page-block/model/page-block.types";
import { isDatabaseListQuery, pageKeys } from "@/entities/page/model/page.queries";
import type { Page } from "@/entities/page/model/page.types";
import { pageBlockKeys } from "./page-block.queries";

function blockListKey(pageId: string, shareToken?: string) {
	return shareToken
		? pageBlockKeys.sharedByPage(pageId, shareToken)
		: pageBlockKeys.byPage(pageId);
}

/** The server marks the Page edited on every block write; mirror it without refetching the Page. */
function markPageEdited(queryClient: QueryClient, pageId: string, shareToken?: string) {
	const updatedAt = new Date().toISOString();
	for (const key of [pageKeys.detail(pageId), ...(shareToken ? [pageKeys.sharedDetail(pageId, shareToken)] : [])]) {
		queryClient.setQueryData<Page>(key, (page) => (page ? { ...page, updatedAt } : page));
	}
}

function notifyBlockWriteError(shareToken?: string) {
	toast.error(
		shareToken
			? "Unable to save this block change. Please check your access and try again."
			: "Unable to save this block change. Please try again.",
	);
}

interface CreateDatabaseBlockInput {
	pageId: string;
	parentBlockId?: string | null;
	afterBlockId?: string | null;
	name?: string;
}
export function useCreateDatabaseBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pageId,
			parentBlockId,
			afterBlockId,
			name = "Untitled",
		}: CreateDatabaseBlockInput) => {
			const database = await databaseApi.createDatabase(pageId, {
				name,
			});

			const view = await databaseApi.createView(database.id, {
				name: "Table",
				type: DatabaseViewType.TABLE,
			});

			const block = await pageBlockApi.create({
				page_id: pageId,

				parent_block_id: parentBlockId ?? null,

				after_block_id: afterBlockId ?? null,

				type: PageBlockType.DATABASE_VIEW,

				content: {},
				style_config: {},
				data_config: {},
			});

			const attachedBlock = await pageBlockApi.attachDatabaseView(
				block.id,
				{
					database_id: database.id,
					view_id: view.id,
				},
			);

			return {
				database,
				view,
				block: attachedBlock,
			};
		},

		onSuccess: async (_, variables) => {
			markPageEdited(queryClient, variables.pageId);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageBlockKeys.byPage(variables.pageId),
				}),
				queryClient.invalidateQueries({
					predicate: isDatabaseListQuery,
				}),
			]);
		},

		onError: () => notifyBlockWriteError(),
	});
}

interface CreatePageBlockInput {
	pageId: string;
	parentBlockId?: string | null;
	afterBlockId?: string | null;
	type: PageBlockType;
	content?: PageBlockJson;
	styleConfig?: PageBlockJson;
	dataConfig?: PageBlockJson;
}

export function useCreatePageBlock(shareToken?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "create", shareToken ?? null],
		mutationFn: ({
			pageId,
			parentBlockId = null,
			afterBlockId,
			type,
			content = {},
			styleConfig = {},
			dataConfig = {},
		}: CreatePageBlockInput) =>
			pageBlockApi.create(
				{
					page_id: pageId,
					parent_block_id: parentBlockId,
					after_block_id: afterBlockId,
					type,
					content,
					style_config: styleConfig,
					data_config: dataConfig,
				},
				shareToken,
			),

		onSuccess: async (_, variables) => {
			markPageEdited(queryClient, variables.pageId, shareToken);
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken),
				exact: true,
			});
		},
		onError: () => notifyBlockWriteError(shareToken),
	});
}

interface UpdatePageBlockInput {
	blockId: string;
	pageId: string;

	type?: PageBlockType;
	title?: string | null;
	content?: PageBlockJson;
	styleConfig?: PageBlockStyleConfig;
	dataConfig?: PageBlockJson;
	isOpen?: boolean;
}

export function useUpdatePageBlock(shareToken?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "update", shareToken ?? null],
		mutationFn: ({
			blockId,
			type,
			title,
			content,
			styleConfig,
			dataConfig,
			isOpen,
		}: UpdatePageBlockInput) =>
			pageBlockApi.update(
				blockId,
				{
					type,
					title,
					content,
					style_config: styleConfig,
					data_config: dataConfig,
					is_open: isOpen,
				},
				shareToken,
			),

		onSuccess: async (_, variables) => {
			markPageEdited(queryClient, variables.pageId, shareToken);
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken),
				exact: true,
			});
		},
		onError: () => notifyBlockWriteError(shareToken),
	});
}

interface TransformToDatabaseBlockInput {
	blockId: string;
	pageId: string;
	name?: string;
}

export function useTransformToDatabaseBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			blockId,
			pageId,
			name = "Untitled",
		}: TransformToDatabaseBlockInput) => {
			// 1. Tạo Database
			const database = await databaseApi.createDatabase(pageId, {
				name,
			});

			// 2. Tạo default Table View
			const view = await databaseApi.createView(database.id, {
				name: "Table",
				type: DatabaseViewType.TABLE,
			});

			// 3. Biến chính TEXT block "/" thành DATABASE_VIEW
			await pageBlockApi.update(blockId, {
				type: PageBlockType.DATABASE_VIEW,
				content: null,
				style_config: null,
				data_config: null,
			});

			// 4. Gắn Database + View vào chính block đó
			const block = await pageBlockApi.attachDatabaseView(blockId, {
				database_id: database.id,
				view_id: view.id,
			});

			return {
				database,
				view,
				block,
			};
		},

		onSuccess: (_, variables) => {
			markPageEdited(queryClient, variables.pageId);
			queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});

			queryClient.invalidateQueries({
				predicate: isDatabaseListQuery,
			});
		},

		onError: () => notifyBlockWriteError(),
	});
}

interface DeletePageBlockInput {
	blockId: string;
	pageId: string;
}

export function useDeletePageBlock(shareToken?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "delete", shareToken ?? null],
		mutationFn: ({ blockId }: DeletePageBlockInput) =>
			pageBlockApi.delete(blockId, shareToken),

		onSuccess: async (_, variables) => {
			markPageEdited(queryClient, variables.pageId, shareToken);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: blockListKey(variables.pageId, shareToken),
					exact: true,
				}),
				// The deleted block (or its children) may hold a database → moves it to Trash.
				queryClient.invalidateQueries({
					predicate: isDatabaseListQuery,
				}),
			]);
		},
		onError: () => notifyBlockWriteError(shareToken),
	});
}

export function useResolveBookmarkMetadata() {
	return useMutation({
		mutationFn: (url: string) =>
			pageBlockApi.resolveBookmarkMetadata({
				url,
			}),
	});
}
