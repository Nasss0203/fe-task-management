"use client";

import { useMemo } from "react";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockRowProvider } from "@/entities/page-block/model/page-block-row-scope";
import { useRowPageBlocks } from "@/entities/page-block/model/page-block.queries";

import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";

interface RowContentProps {
	pageId: string;
	rowId: string;
	readOnly: boolean;
	shareToken?: string;
}

export function RowContent({
	pageId,
	rowId,
	readOnly,
	shareToken,
}: RowContentProps) {
	const { data: blocks = [], isLoading } = useRowPageBlocks(
		rowId,
		shareToken,
	);
	const blockTree = useMemo(() => buildPageBlockTree(blocks), [blocks]);

	if (isLoading || (readOnly && blocks.length === 0)) return null;

	return (
		<section aria-label='Content' className='mt-8 border-t pt-5'>
			<PageBlockRowProvider value={rowId}>
				<PageBlockList
					key={rowId}
					pageId={pageId}
					blocks={blockTree}
					canEdit={!readOnly}
					shareToken={shareToken}
				/>
			</PageBlockRowProvider>
		</section>
	);
}
