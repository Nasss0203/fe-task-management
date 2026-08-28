"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DatabaseViewType } from "@/entities/database/model/database.types";

import { databaseApi } from "@/entities/database/api/database.api";
import { pageBlockApi } from "@/entities/page-block/api/page-block.api";
import {
	PageBlockJson,
	PageBlockStyleConfig,
	PageBlockType,
} from "@/entities/page-block/model/page-block.types";
import { pageBlockKeys } from "./page-block.queries";

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
			await queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});
		},
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

export function useCreatePageBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			pageId,
			parentBlockId = null,
			afterBlockId,
			type,
			content = {},
			styleConfig = {},
			dataConfig = {},
		}: CreatePageBlockInput) =>
			pageBlockApi.create({
				page_id: pageId,
				parent_block_id: parentBlockId,
				after_block_id: afterBlockId,
				type,
				content,
				style_config: styleConfig,
				data_config: dataConfig,
			}),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});
		},
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

export function useUpdatePageBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			blockId,
			type,
			title,
			content,
			styleConfig,
			dataConfig,
			isOpen,
		}: UpdatePageBlockInput) =>
			pageBlockApi.update(blockId, {
				type,
				title,
				content,
				style_config: styleConfig,
				data_config: dataConfig,
				is_open: isOpen,
			}),

		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});
		},
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
			queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});
		},
	});
}

interface DeletePageBlockInput {
	blockId: string;
	pageId: string;
}

export function useDeletePageBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ blockId }: DeletePageBlockInput) =>
			pageBlockApi.delete(blockId),

		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: pageBlockKeys.byPage(variables.pageId),
			});
		},
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
