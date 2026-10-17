"use client";

import { useFormContext, useWatch } from "react-hook-form";

import type { TemplateBlock } from "@/entities/template";

import {
	selectAllDemoBlocks,
	toggleDemoBlock,
	type DemoSelection,
} from "../../model/demo-visibility";
import type { DemoDatabaseRules, ListingFormValues } from "../../model/listing-form";

/** Reads and edits the demo allowlist stored in the listing form. */
export function useDemoSelection(blocks: TemplateBlock[]) {
	const { control, setValue, formState } = useFormContext<ListingFormValues>();
	const [blockIds, databases] = useWatch({
		control,
		name: ["demo_block_ids", "demo_databases"],
	});
	const options = { shouldDirty: true, shouldValidate: formState.isSubmitted };

	const apply = (next: DemoSelection) => {
		setValue("demo_block_ids", next.blockIds, options);
		setValue("demo_databases", next.databases, options);
	};
	const selection: DemoSelection = { blockIds, databases };

	return {
		selection,
		selected: new Set(blockIds),
		databases,
		error: formState.errors.demo_block_ids?.message,
		toggle: (blockId: string, checked: boolean) =>
			apply(toggleDemoBlock(selection, blocks, blockId, checked)),
		selectAll: () => apply(selectAllDemoBlocks(blocks)),
		clear: () => apply({ blockIds: [], databases: {} }),
		updateDatabase: (databaseId: string, patch: Partial<DemoDatabaseRules>) => {
			const current = databases[databaseId];
			if (!current) return;
			setValue(
				"demo_databases",
				{ ...databases, [databaseId]: { ...current, ...patch } },
				options,
			);
		},
	};
}

export type DemoSelectionApi = ReturnType<typeof useDemoSelection>;
