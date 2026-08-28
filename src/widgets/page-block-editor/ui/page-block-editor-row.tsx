"use client";

import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

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

interface PageBlockEditorRowProps {
	block: PageBlockNode;
}

export function PageBlockEditorRow({ block }: PageBlockEditorRowProps) {
	const [open, setOpen] = useState(false);
	const [actionOpen, setActionOpen] = useState(false);

	const createBlockMutation = useCreatePageBlock();
	const createDatabaseBlockMutation = useCreateDatabaseBlock();

	const handleCreateBlock = ({ type, styleConfig }: PageBlockCommand) => {
		if (type === PageBlockType.DATABASE_VIEW) {
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
		<div className='grid w-full grid-cols-[28px_28px_minmax(0,1fr)] items-center'>
			{/* Add block */}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='size-7'
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
					<PageBlockCommandMenu onSelect={handleCreateBlock} />
				</PopoverContent>
			</Popover>

			{/* Drag */}
			<Popover open={actionOpen} onOpenChange={setActionOpen}>
				<PopoverTrigger asChild>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='
                size-7
                cursor-pointer
                text-muted-foreground
            '
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
						onClose={() => setActionOpen(false)}
					/>
				</PopoverContent>
			</Popover>

			{/* Block content */}
			<div className='min-w-0 pl-1'>
				<PageBlockRenderer block={block} />
			</div>
		</div>
	);
}
