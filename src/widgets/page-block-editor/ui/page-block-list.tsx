import { FileText, LockKeyhole } from "lucide-react";
import { useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";
import { BlockCommentsButton } from "@/widgets/page-comments/ui/block-comments-button";

import { useScrollToBlockHash } from "../model/use-scroll-to-block-hash";
import { AddBlockBelow } from "./add-block-below";
import { BlockDragProvider } from "./block-drag-provider";
import { EmptyPageBlockRow } from "./empty-page-block-row";
import { PageBlockEditorProvider } from "./page-block-editor-context";
import { PageBlockEditorRow } from "./page-block-editor-row";

interface PageBlockListProps {
	pageId: string;
	blocks: PageBlockNode[];
	canEdit: boolean;

	/**
	 * Có giá trị khi Page được mở từ:
	 * /share/:token
	 *
	 * Page bình thường trong dashboard
	 * sẽ không truyền prop này.
	 */
	shareToken?: string;
}

/**
 * Thứ tự hiển thị (gồm child của Toggle đang mở),
 * để Backspace ở child nhảy về đúng block phía trên.
 */
function getVisibleBlockIds(blocks: PageBlockNode[]): string[] {
	return blocks.flatMap((block) => {
		const children = block.is_open ? getVisibleBlockIds(block.children) : [];
		// Column rows and columns hold no text: Backspace skips to their blocks.
		return block.type === PageBlockType.COLUMN_LIST ||
			block.type === PageBlockType.COLUMN
			? children
			: [block.id, ...children];
	});
}

interface ReadOnlyBlockRowProps {
	block: PageBlockNode;
	shareToken?: string;
}

function ReadOnlyBlockRow({ block, shareToken }: ReadOnlyBlockRowProps) {
	const [commentOpen, setCommentOpen] = useState(false);

	return (
		<div
			id={`block-${block.id}`}
			className='group -mx-2 grid min-h-8 w-[calc(100%+1rem)] grid-cols-[28px_28px_minmax(0,1fr)_36px] items-center rounded-md px-2 transition-colors duration-150 hover:bg-muted/40'
		>
			<div className='size-7' aria-hidden='true' />

			<div
				className='flex size-7 items-center justify-center'
				aria-hidden='true'
			>
				<LockKeyhole className='size-3.5 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-70' />
			</div>

			<div className='min-w-0 py-0.5 pl-1'>
				<ReadOnlyPageBlockRenderer
					block={block}
					shareToken={shareToken}
				/>
			</div>

			{/* Người chỉ xem / COMMENTER vẫn đọc (và COMMENTER viết) được comment của block */}
			<BlockCommentsButton
				pageId={block.page_id}
				blockId={block.id}
				open={commentOpen}
				onOpenChange={setCommentOpen}
				hoverOnlyClassName='opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100'
				shareToken={shareToken}
			/>
		</div>
	);
}

export function PageBlockList({
	pageId,
	blocks,
	canEdit,
	shareToken,
}: PageBlockListProps) {
	useScrollToBlockHash(blocks.length > 0);

	if (!canEdit) {
		return (
			<div className='w-full min-w-0 max-w-full space-y-1'>
				{blocks.map((block) => (
					<ReadOnlyBlockRow
						key={block.id}
						block={block}
						shareToken={shareToken}
					/>
				))}

				{blocks.length === 0 && (
					<div className='flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 text-center'>
						<div className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
							<FileText className='size-5' />
						</div>

						<div className='space-y-1'>
							<p className='text-sm font-medium text-foreground/80'>
								Trang này chưa có nội dung
							</p>

							<p className='text-xs text-muted-foreground'>
								Bạn đang xem trang ở chế độ chỉ đọc.
							</p>
						</div>
					</div>
				)}
			</div>
		);
	}

	const orderedBlockIds = getVisibleBlockIds(blocks);

	return (
		<PageBlockEditorProvider
			key={`${pageId}:${shareToken ?? ""}`}
			orderedBlockIds={orderedBlockIds}
		>
			<BlockDragProvider pageId={pageId} blocks={blocks} shareToken={shareToken}>
				<div className='w-full min-w-0 max-w-full space-y-2'>
					{blocks.map((block) => (
						<PageBlockEditorRow
							key={block.id}
							block={block}
							shareToken={shareToken}
						/>
					))}

					{blocks.length === 0 ? (
						<EmptyPageBlockRow pageId={pageId} shareToken={shareToken} />
					) : (
						<AddBlockBelow
							pageId={pageId}
							blocks={blocks}
							shareToken={shareToken}
						/>
					)}
				</div>
			</BlockDragProvider>
		</PageBlockEditorProvider>
	);
}
