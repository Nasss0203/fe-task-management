"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	DatabaseViewType,
	PropertyType,
} from "@/entities/database/model/database.types";

import { databaseApi } from "@/entities/database/api/database.api";
import { pageBlockApi } from "@/entities/page-block/api/page-block.api";
import { pageApi } from "@/entities/page/api/page.api";
import { isDatabaseListQuery, pageKeys } from "@/entities/page/model/page.queries";
import {
	FormAnswerValue,
	PageBlockJson,
	PageBlockStyleConfig,
	PageBlockType,
} from "@/entities/page-block/model/page-block.types";
import { usePageBlockRowId } from "./page-block-row-scope";
import { databaseKeys } from "@/entities/database/model/database.queries";

import { pageBlockKeys } from "./page-block.queries";

/** The list a block lives in: a task's content when `rowId` is set, else the page's. */
export function blockListKey(pageId: string, shareToken?: string, rowId?: string | null) {
	if (rowId) {
		return shareToken
			? pageBlockKeys.sharedByRow(rowId, shareToken)
			: pageBlockKeys.byRow(rowId);
	}
	return shareToken
		? pageBlockKeys.sharedByPage(pageId, shareToken)
		: pageBlockKeys.byPage(pageId);
}

function notifyBlockWriteError(shareToken?: string) {
	toast.error(
		shareToken
			? "Unable to save this block change. Please check your access and try again."
			: "Unable to save this block change. Please try again.",
	);
}

// Tên view đầu tiên theo kiểu, giống khi bấm "+" thêm view
const FIRST_VIEW_NAMES: Record<DatabaseViewType, string> = {
	[DatabaseViewType.TABLE]: "Table",
	[DatabaseViewType.BOARD]: "Board",
	[DatabaseViewType.CALENDAR]: "Calendar",
	[DatabaseViewType.LIST]: "List",
};

interface CreateDatabaseBlockInput {
	pageId: string;
	parentBlockId?: string | null;
	afterBlockId?: string | null;
	name?: string;
	viewType?: DatabaseViewType;
}
async function createDatabaseWithBlock(
	{
		pageId,
		parentBlockId,
		afterBlockId,
		name = "Untitled",
		viewType = DatabaseViewType.TABLE,
	}: CreateDatabaseBlockInput,
	titleOnly = false,
) {
	const database = await databaseApi.createDatabase(pageId, {
		name,
		title_only: titleOnly,
	});

	const view = await databaseApi.createView(database.id, {
		name: FIRST_VIEW_NAMES[viewType],
		type: viewType,
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

	const attachedBlock = await pageBlockApi.attachDatabaseView(block.id, {
		database_id: database.id,
		view_id: view.id,
	});

	return {
		database,
		view,
		block: attachedBlock,
	};
}

export function useCreateDatabaseBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateDatabaseBlockInput) =>
			createDatabaseWithBlock(input),

		onSuccess: async (_, variables) => {
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
	const rowId = usePageBlockRowId();

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
					row_id: rowId,
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
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken, rowId),
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
	const rowId = usePageBlockRowId();

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
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken, rowId),
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
	viewType?: DatabaseViewType;
}

export function useTransformToDatabaseBlock() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			blockId,
			pageId,
			name = "Untitled",
			viewType = DatabaseViewType.TABLE,
		}: TransformToDatabaseBlockInput) => {
			// 1. Tạo Database
			const database = await databaseApi.createDatabase(pageId, {
				name,
			});

			// 2. Tạo view đầu tiên theo kiểu đã chọn (mặc định Table)
			const view = await databaseApi.createView(database.id, {
				name: FIRST_VIEW_NAMES[viewType],
				type: viewType,
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

			queryClient.invalidateQueries({
				predicate: isDatabaseListQuery,
			});
		},

		onError: () => notifyBlockWriteError(),
	});
}

interface CreatePageBlockColumnsInput {
	pageId: string;
	parentBlockId: string | null;
	/** How many columns the row gets (2–5). */
	count: number;
	/** An existing block that becomes the first column ("Turn into", "/" in a text). */
	blockId?: string;
	/** Otherwise the row goes right after this block (null = top of the page). */
	afterBlockId?: string | null;
}

/**
 * "2 columns" / "3 columns": adds an empty text block for every column that
 * has no block yet, then puts them side by side in one request.
 */
export function useCreatePageBlockColumns(shareToken?: string) {
	const queryClient = useQueryClient();
	const rowId = usePageBlockRowId();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "columns", shareToken ?? null],
		mutationFn: async ({
			pageId,
			parentBlockId,
			count,
			blockId,
			afterBlockId = null,
		}: CreatePageBlockColumnsInput) => {
			const blockIds = blockId ? [blockId] : [];
			let after = blockId ?? afterBlockId;

			while (blockIds.length < count) {
				const created = await pageBlockApi.create(
					{
						page_id: pageId,
						row_id: rowId,
						parent_block_id: parentBlockId,
						after_block_id: after,
						type: PageBlockType.TEXT,
						content: { text: "" },
					},
					shareToken,
				);
				blockIds.push(created.id);
				after = created.id;
			}

			await pageBlockApi.createColumns(
				{ page_id: pageId, block_ids: blockIds },
				shareToken,
			);
			// The first column's block, to put the cursor there.
			return blockIds[0];
		},

		// Refresh even after a failure: empty blocks may already exist.
		onSettled: async (_, __, variables) => {
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken, rowId),
				exact: true,
			});
		},
		onError: () => notifyBlockWriteError(shareToken),
	});
}

interface SubmitPageFormInput {
	sectionBlockId: string;
	databaseId: string;
	answers: Record<string, unknown>;
}

export function useSubmitPageForm(shareToken?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ sectionBlockId, answers }: SubmitPageFormInput) =>
			pageBlockApi.submitForm(sectionBlockId, answers, shareToken),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.rows(variables.databaseId),
			});
		},
	});
}

interface SetFormAnswerKeyInput {
	sectionBlockId: string;
	fieldBlockId: string;
	correctValue: FormAnswerValue | null;
	points: number;
}

export function useSetFormAnswerKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			sectionBlockId,
			fieldBlockId,
			correctValue,
			points,
		}: SetFormAnswerKeyInput) =>
			pageBlockApi.setAnswerKey(sectionBlockId, fieldBlockId, {
				correct_value: correctValue,
				points,
			}),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: pageBlockKeys.answerKeys(variables.sectionBlockId),
			});
		},
	});
}

interface CreateFormInput {
	pageId: string;
	parentBlockId: string | null;
	afterBlockId?: string | null;
	quiz?: boolean;
}

/**
 * Answers go to a sibling page: pages inherit shares from their parent,
 * so a child page would open the answers to everyone the form is shared with.
 */
export function useCreateForm() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pageId,
			parentBlockId,
			afterBlockId,
			quiz,
		}: CreateFormInput) => {
			const responsesTitle = quiz ? "Quiz responses" : "Form responses";
			const page = await pageApi.getById(pageId);
			const responsesPage = await pageApi.create({
				workspace_id: page.workspace_id,
				teamspace_id: page.teamspace_id,
				parent_page_id: page.parent_page_id,
				title: responsesTitle,
			});
			const { database } = await createDatabaseWithBlock(
				{ pageId: responsesPage.id, name: responsesTitle },
				true,
			);
			const respondent = await databaseApi.addProperty(database.id, {
				name: "Submitted by",
				type: PropertyType.PERSON,
			});
			const score = quiz
				? await databaseApi.addProperty(database.id, {
						name: "Score",
						type: PropertyType.NUMBER,
					})
				: null;
			const title = database.properties.find(
				(property) => property.type === PropertyType.TITLE,
			);

			const section = await pageBlockApi.create({
				page_id: pageId,
				parent_block_id: parentBlockId,
				after_block_id: afterBlockId ?? null,
				type: PageBlockType.SECTION,
				content: { title: "", description: "" },
				data_config: {
					form: {
						database_id: database.id,
						respondent_property_id: respondent.id,
					},
					...(score && {
						quiz: {
							show_result: "score",
							max_attempts: null,
							score_property_id: score.id,
						},
					}),
				},
			});

			if (title) {
				await pageBlockApi.create({
					page_id: pageId,
					parent_block_id: section.id,
					type: PageBlockType.FORM_FIELD,
					content: { label: title.name },
					data_config: { property_id: title.id, required: true },
				});
			}

			return { section, workspaceId: page.workspace_id };
		},

		onSuccess: async ({ workspaceId }, { pageId }) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: blockListKey(pageId),
					exact: true,
				}),
				queryClient.invalidateQueries({
					queryKey: pageKeys.byWorkspace(workspaceId),
				}),
			]);
		},
		onError: () => notifyBlockWriteError(),
	});
}

interface WrapInSectionInput {
	blockId: string;
	pageId: string;
	parentBlockId: string | null;
}

export function useWrapInSection(shareToken?: string) {
	const queryClient = useQueryClient();
	const rowId = usePageBlockRowId();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "wrap-section", shareToken ?? null],
		mutationFn: async ({ blockId, pageId, parentBlockId }: WrapInSectionInput) => {
			const section = await pageBlockApi.create(
				{
					page_id: pageId,
					row_id: rowId,
					parent_block_id: parentBlockId,
					after_block_id: blockId,
					type: PageBlockType.SECTION,
					content: { title: "", description: "" },
				},
				shareToken,
			);
			await pageBlockApi.move(
				blockId,
				{ target_parent_block_id: section.id, target_order_index: 0 },
				shareToken,
			);
			return section.id;
		},

		onSettled: async (_, __, variables) => {
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken, rowId),
				exact: true,
			});
		},
		onError: () => notifyBlockWriteError(shareToken),
	});
}

interface DuplicatePageBlockInput {
	blockId: string;
	pageId: string;
}

export function useDuplicatePageBlock(shareToken?: string) {
	const queryClient = useQueryClient();
	const rowId = usePageBlockRowId();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "duplicate", shareToken ?? null],
		mutationFn: ({ blockId }: DuplicatePageBlockInput) =>
			pageBlockApi.duplicate(blockId, shareToken),

		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: blockListKey(variables.pageId, shareToken, rowId),
				exact: true,
			});
		},
		onError: () => notifyBlockWriteError(shareToken),
	});
}

interface DeletePageBlockInput {
	blockId: string;
	pageId: string;
}

export function useDeletePageBlock(shareToken?: string) {
	const queryClient = useQueryClient();
	const rowId = usePageBlockRowId();

	return useMutation({
		mutationKey: [...pageBlockKeys.all, "delete", shareToken ?? null],
		mutationFn: ({ blockId }: DeletePageBlockInput) =>
			pageBlockApi.delete(blockId, shareToken),

		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: blockListKey(variables.pageId, shareToken, rowId),
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
