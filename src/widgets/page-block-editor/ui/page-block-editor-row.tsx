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
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockRenderer } from "@/widgets/page-block/ui/page-block-renderer";
import { PageBlockActionMenu } from "./page-block-action-menu";
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

	const createBlockMutation = useCreatePageBlock(shareToken);
	const createDatabaseBlockMutation = useCreateDatabaseBlock();

	const handleCreateBlock = ({ type, styleConfig }: PageBlockCommand) => {
		if (type === PageBlockType.DATABASE_VIEW) {
			if (shareToken) return;

			createDatabaseBlockMutation.mutate(
				{
					pageId: block.page_id,
					parentBlockId: block.parent_block_id,
					afterBlockId: block.id,
					name: "Untitled",
				},
				{
					onSuccess: () => {
						setOpen(false);
					},
				},
			);

			return;
		}

		createBlockMutation.mutate({
			pageId: block.page_id,

			parentBlockId: block.parent_block_id,

			afterBlockId: block.id,

			type,

			content: {},

			styleConfig: styleConfig ?? {},

			dataConfig: {},
		});
	};

	return (
		<div
			data-block-row=''
			className='grid w-full grid-cols-[28px_28px_minmax(0,1fr)] items-start'
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
			<Popover open={actionOpen} onOpenChange={setActionOpen}>
				<PopoverTrigger asChild>
					<Button
						type='button'
						aria-label='Block actions'
						variant='ghost'
						size='icon'
						className={cn(
							"size-7 cursor-pointer text-muted-foreground",
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
					/>
				</PopoverContent>
			</Popover>

			{/* Block content */}
			<div className='min-w-0 pl-1'>
				<PageBlockRenderer block={block} shareToken={shareToken} />
			</div>
		</div>
	);
}
