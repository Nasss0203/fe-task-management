"use client";

import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import {
	useCreateDatabaseBlock,
	useCreatePageBlock,
	useCreatePageBlockColumns,
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockRenderer } from "@/widgets/page-block/ui/page-block-renderer";
import { ColumnListBlockEditor } from "@/widgets/page-block-renderer/ui/column-list-block-editor";
import { BlockCommentsButton } from "@/widgets/page-comments/ui/block-comments-button";
import type { DropPosition } from "../lib/plan-block-drop";
import { useBlockDrag } from "./block-drag-provider";
import { PageBlockActionMenu } from "./page-block-action-menu";
import { usePageBlockEditor } from "./page-block-editor-context";
import {
	PageBlockCommand,
	PageBlockCommandMenu,
} from "./page-block-command-menu";

/**
 * Chỉ hiện "+" và menu block của row đang hover sâu nhất,
 * để hover vào child của Toggle thì nút của Toggle ẩn đi.
 */
const ROW_HANDLE_CLASS =
	"opacity-0 transition-opacity focus-visible:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100 [[data-block-row]:hover:not(:has([data-block-row]:hover))>&]:opacity-100";

interface PageBlockEditorRowProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function PageBlockEditorRow({ block, shareToken }: PageBlockEditorRowProps) {
	const [open, setOpen] = useState(false);
	const [actionOpen, setActionOpen] = useState(false);
	const [commentOpen, setCommentOpen] = useState(false);
	const { handleRef, handleProps, dragRef, dropRef, isDragging, indicator, justDropped } =
		useBlockDrag(block.id);

	const createBlockMutation = useCreatePageBlock(shareToken);
	const createDatabaseBlockMutation = useCreateDatabaseBlock();
	const createColumnsMutation = useCreatePageBlockColumns(shareToken);
	const { requestFocus } = usePageBlockEditor();

	const handleCreateBlock = ({
		type,
		styleConfig,
		viewType,
		columnCount,
	}: PageBlockCommand) => {
		if (columnCount) {
			setOpen(false);
			createColumnsMutation.mutate(
				{
					pageId: block.page_id,
					parentBlockId: block.parent_block_id,
					afterBlockId: block.id,
					count: columnCount,
				},
				// Empty columns show nothing until focused: start typing in the first one.
				{ onSuccess: requestFocus },
			);
			return;
		}

		if (type === PageBlockType.DATABASE_VIEW) {
			if (shareToken) return;

			createDatabaseBlockMutation.mutate(
				{
					pageId: block.page_id,
					parentBlockId: block.parent_block_id,
					afterBlockId: block.id,
					name: "Untitled",
					viewType,
				},
				{
					onSuccess: () => {
						setOpen(false);
					},
				},
			);

			return;
		}

		createBlockMutation.mutate(
			{
				pageId: block.page_id,
				parentBlockId: block.parent_block_id,
				afterBlockId: block.id,
				type,
				content: {},
				styleConfig: styleConfig ?? {},
				dataConfig: {},
			},
			{
				onSuccess: (created) => {
					if (type === PageBlockType.SECTION) requestFocus(created.id);
				},
			},
		);
	};

	// A column row has no handles of its own: each block inside its columns has them.
	if (block.type === PageBlockType.COLUMN_LIST) {
		return (
			<div id={`block-${block.id}`} className='w-full'>
				<ColumnListBlockEditor block={block} shareToken={shareToken} />
			</div>
		);
	}

	return (
		<div
			id={`block-${block.id}`}
			data-block-row=''
			ref={(element) => {
				dropRef(element);
				dragRef(element);
			}}
			className={cn(
				"grid w-full grid-cols-[28px_28px_minmax(0,1fr)_36px] items-start rounded-md transition-colors duration-500",
				isDragging && "opacity-40",
			)}
		>
			{/* Add block */}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type='button'
						aria-label='Add block'
						variant='ghost'
						size='icon'
						className={cn("size-7 text-muted-foreground", ROW_HANDLE_CLASS)}
					>
						<Plus className='size-4' />
					</Button>
				</PopoverTrigger>

				<PopoverContent
					side='bottom'
					align='start'
					sideOffset={6}
					className='w-64 p-0'
				>
					<PageBlockCommandMenu
						onSelect={handleCreateBlock}
						allowDatabase={!shareToken}
					/>
				</PopoverContent>
			</Popover>

			{/* Drag */}
			<Popover
				open={actionOpen}
				onOpenChange={(next) => {
					// The click that ends a drag is not a request for the menu.
					if (next && justDropped()) return;
					setActionOpen(next);
				}}
			>
				<PopoverTrigger asChild>
					<Button
						ref={handleRef}
						{...handleProps}
						type='button'
						aria-label='Block actions'
						title='Drag to move · click for options'
						variant='ghost'
						size='icon'
						className={cn(
							"size-7 cursor-grab touch-none text-muted-foreground active:cursor-grabbing",
							ROW_HANDLE_CLASS,
						)}
					>
						<GripVertical className='size-4' />
					</Button>
				</PopoverTrigger>

				<PopoverContent
					side='bottom'
					align='start'
					sideOffset={6}
					collisionPadding={12}
					className='
            w-auto
            border-0
            bg-transparent
            p-0
            shadow-none
        '
				>
					<PageBlockActionMenu
						block={block}
						shareToken={shareToken}
						onClose={() => setActionOpen(false)}
						onComment={
							shareToken
								? undefined
								: // Đợi menu đóng xong (trả focus) rồi mới mở, kẻo popover comment đóng ngay
									() => requestAnimationFrame(() => setCommentOpen(true))
						}
					/>
				</PopoverContent>
			</Popover>

			{/* Block content: a faint background on the row under the pointer, like the handles */}
			<div className='relative min-w-0 rounded-md pl-1 transition-colors [[data-block-row]:hover:not(:has([data-block-row]:hover))>&]:bg-muted/40'>
				<PageBlockRenderer block={block} shareToken={shareToken} />
				{indicator && <DropIndicator position={indicator} />}
			</div>

			{/* Comment block; trang share link chỉ đọc comment */}
			<BlockCommentsButton
				pageId={block.page_id}
				blockId={block.id}
				open={commentOpen}
				onOpenChange={setCommentOpen}
				hoverOnlyClassName={ROW_HANDLE_CLASS}
				shareToken={shareToken}
			/>
		</div>
	);
}

/** Blue line where the dragged block will land: above / below, or a side for a new column. */
function DropIndicator({ position }: { position: DropPosition }) {
	return (
		<div
			aria-hidden='true'
			className={cn(
				"pointer-events-none absolute z-10 rounded-full bg-primary",
				position === "before" && "inset-x-0 -top-0.5 h-0.5",
				position === "after" && "inset-x-0 -bottom-0.5 h-0.5",
				position === "left" && "inset-y-0 -left-0.5 w-0.5",
				position === "right" && "inset-y-0 -right-0.5 w-0.5",
			)}
		/>
	);
}
