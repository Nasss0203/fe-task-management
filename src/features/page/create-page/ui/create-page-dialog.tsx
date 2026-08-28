"use client";

import {
	ChevronDown,
	FileText,
	Maximize2,
	MoreHorizontal,
	Star,
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { useState } from "react";

interface CreatePageDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (title: string) => void;
}

export function CreatePageDialog({
	open,
	onOpenChange,
	onCreate,
}: CreatePageDialogProps) {
	const [title, setTitle] = useState("");
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className='
          flex
          h-[min(680px,calc(100vh-64px))]
          w-[calc(100vw-64px)]
          max-w-[1000px]
          flex-col
          gap-0
          overflow-hidden
          rounded-xl
          border
          bg-background
          p-0
          shadow-2xl
          sm:max-w-[1000px]
        '
			>
				<DialogHeader className='sr-only'>
					<DialogTitle>Create page</DialogTitle>
				</DialogHeader>

				{/* HEADER */}
				<header className='flex h-12 shrink-0 items-center justify-between px-4'>
					{/* Left */}
					<div className='flex min-w-0 items-center gap-2'>
						<button
							type='button'
							aria-label='Open as full page'
							className='
                flex size-7 shrink-0
                items-center justify-center
                rounded-md
                text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground
              '
						>
							<Maximize2 className='size-4' />
						</button>

						<div className='mx-1 h-4 w-px shrink-0 bg-border' />

						<button
							type='button'
							className='
                shrink-0 rounded-md
                px-1.5 py-1
                text-sm text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground
              '
						>
							Add to
						</button>

						<FileText className='size-4 shrink-0 text-muted-foreground' />

						<button
							type='button'
							className='
                flex min-w-0 items-center gap-1
                rounded-md px-1.5 py-1
                text-sm font-medium
                transition-colors
                hover:bg-muted
              '
						>
							<span className='truncate'>New page</span>

							<ChevronDown className='size-3.5 shrink-0 text-muted-foreground' />
						</button>
					</div>

					{/* Right */}
					<div className='flex shrink-0 items-center gap-1'>
						<button
							type='button'
							className='
                rounded-md px-2 py-1
                text-sm font-medium
                transition-colors
                hover:bg-muted
              '
						>
							Share
						</button>

						<button
							type='button'
							aria-label='Favorite'
							className='
                flex size-8 items-center
                justify-center rounded-md
                transition-colors
                hover:bg-muted
              '
						>
							<Star className='size-4' />
						</button>

						<button
							type='button'
							aria-label='More'
							className='
                flex size-8 items-center
                justify-center rounded-md
                transition-colors
                hover:bg-muted
              '
						>
							<MoreHorizontal className='size-4' />
						</button>
					</div>
				</header>

				{/* PAGE */}
				<div className='min-h-0 flex-1 overflow-y-auto'>
					<main
						className='
              mx-auto
              w-full
              max-w-[720px]
              px-8
              pb-24
              pt-20
            '
					>
						<input
							autoFocus
							type='text'
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									onCreate(title.trim() || "Untitled");
								}
							}}
							placeholder='New page'
							className='
    block w-full border-0 bg-transparent p-0
    text-[40px] font-bold leading-[1.15]
    tracking-[-0.02em] outline-none
    placeholder:text-muted-foreground/25
  '
						/>
						<div className='mt-5 min-h-10' />
					</main>
				</div>
			</DialogContent>
		</Dialog>
	);
}
