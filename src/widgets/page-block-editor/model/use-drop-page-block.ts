"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";

import { pageBlockApi } from "@/entities/page-block/api/page-block.api";
import { usePageBlockRowId } from "@/entities/page-block/model/page-block-row-scope";
import { blockListKey } from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import type { BlockDropPlan } from "../lib/plan-block-drop";

/** Runs the API calls of one drop, then refreshes the page (or task) blocks once. */
export function useDropPageBlock(pageId: string, shareToken?: string) {
	const queryClient = useQueryClient();
	const rowId = usePageBlockRowId();

	const move = (blockId: string, parentId: string | null, index: number) =>
		pageBlockApi.move(
			blockId,
			{ target_parent_block_id: parentId, target_order_index: index },
			shareToken,
		);

	return useMutation({
		mutationFn: async (plan: BlockDropPlan) => {
			switch (plan.type) {
				case "move":
					await move(plan.blockId, plan.parentId, plan.index);
					return;

				case "columns":
					if (plan.moveFirst) {
						const { blockId, parentId, index } = plan.moveFirst;
						await move(blockId, parentId, index);
					}
					await pageBlockApi.createColumns(
						{ page_id: pageId, block_ids: plan.blockIds },
						shareToken,
					);
					return;

				case "add-column": {
					// A new column is added last, moved to its place, then given the block.
					const column = await pageBlockApi.create(
						{
							page_id: pageId,
							row_id: rowId,
							parent_block_id: plan.columnListId,
							type: PageBlockType.COLUMN,
							style_config: { width_ratio: plan.widthRatio },
						},
						shareToken,
					);
					await move(column.id, plan.columnListId, plan.columnIndex);
					await move(plan.blockId, column.id, 0);
				}
			}
		},

		// Partial drops (a failed later call) still changed the page: always refetch.
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: blockListKey(pageId, shareToken, rowId),
				exact: true,
			}),
		// The server says why (e.g. a full column row), which beats a generic retry.
		onError: (error) =>
			toast.error(getApiErrorMessage(error, "Couldn't move the block. Please try again.")),
	});
}
