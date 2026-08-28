"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useCreatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import {
	PageBlockCommand,
	PageBlockCommandMenu,
} from "./page-block-command-menu";

interface EmptyPageBlockRowProps {
	pageId: string;
}

export function EmptyPageBlockRow({ pageId }: EmptyPageBlockRowProps) {
	const [open, setOpen] = useState(false);

	const createBlockMutation = useCreatePageBlock();

	const handleSelect = ({ type, styleConfig }: PageBlockCommand) => {
		// DATABASE_VIEW xử lý riêng
		if (type === PageBlockType.DATABASE_VIEW) {
			setOpen(false);
			return;
		}

		createBlockMutation.mutate(
			{
				pageId,
				parentBlockId: null,
				type,
				content: {},
				styleConfig: styleConfig ?? {},
				dataConfig: {},
			},
			{
				onSuccess: () => {
					setOpen(false);
				},
			},
		);
	};

	return (
		<div className='group flex min-h-10 w-full items-center'>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						disabled={createBlockMutation.isPending}
						className='
              mr-2 flex size-7 items-center
              justify-center rounded-md
              text-muted-foreground
              opacity-0 transition-opacity
              hover:bg-muted
              hover:text-foreground
              disabled:opacity-50
              group-hover:opacity-100
            '
					>
						<Plus className='size-4' />
					</button>
				</PopoverTrigger>

				<PopoverContent
					side='bottom'
					align='start'
					className='
            w-auto border-0
            bg-transparent p-0
            shadow-none
          '
				>
					<PageBlockCommandMenu onSelect={handleSelect} />
				</PopoverContent>
			</Popover>

			<button
				type='button'
				onClick={() => setOpen(true)}
				className='
          flex-1 py-1 text-left
          text-sm
          text-muted-foreground/60
        '
			>
				Press &apos;/&apos; for commands
			</button>
		</div>
	);
}
