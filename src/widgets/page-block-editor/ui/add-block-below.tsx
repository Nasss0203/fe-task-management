"use client";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useCreatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { usePageBlockEditor } from "./page-block-editor-context";

interface AddBlockBelowProps {
	pageId: string;
	blocks: PageBlockNode[];
	shareToken?: string;
}

function isEmptyText(block: PageBlockNode | undefined): boolean {
	const text = (block?.content as { text?: unknown } | null)?.text;
	return block?.type === PageBlockType.TEXT && !text;
}

export function AddBlockBelow({
	pageId,
	blocks,
	shareToken,
}: AddBlockBelowProps) {
	const createBlock = useCreatePageBlock(shareToken);
	const { requestFocus } = usePageBlockEditor();
	const last = blocks.at(-1);

	const addLine = async () => {
		if (last && isEmptyText(last)) {
			requestFocus(last.id);
			return;
		}

		const created = await createBlock.mutateAsync({
			pageId,
			parentBlockId: null,
			afterBlockId: last?.id ?? null,
			type: PageBlockType.TEXT,
			content: { text: "" },
		});
		requestFocus(created.id);
	};

	return (
		<button
			type='button'
			aria-label='Add a block at the end'
			disabled={createBlock.isPending}
			onClick={() => void addLine()}
			className='block h-24 w-full cursor-text'
		/>
	);
}
