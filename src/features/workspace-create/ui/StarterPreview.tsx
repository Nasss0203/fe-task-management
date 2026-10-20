"use client";

import * as React from "react";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	ReadOnlyCalloutBlock,
	ReadOnlyHeadingBlock,
	ReadOnlyListBlock,
	ReadOnlyQuoteBlock,
	ReadOnlyTextBlock,
	ReadOnlyTodoBlock,
} from "@/entities/page-block/ui/read-only-block-content";
import type {
	WorkspaceStarterBlock,
	WorkspaceStarterDefinition,
	WorkspaceStarterPage,
} from "@/entities/workspace/model/workspace.types";
import { cn } from "@/shared/lib/utils";
import { Separator } from "@/shared/ui/separator";

interface StarterPreviewProps {
	starter: WorkspaceStarterDefinition;
	workspaceName: string;
}

export function StarterPreview({ starter, workspaceName }: StarterPreviewProps) {
	const pages: WorkspaceStarterPage[] =
		starter.pages.length > 0
			? starter.pages
			: [{ title: workspaceName, icon: "📄", blocks: [] }];
	const [pageIndex, setPageIndex] = React.useState(0);
	const page = pages[pageIndex] ?? pages[0];

	return (
		<div className='flex min-h-0 flex-1 flex-col p-6'>
			<p className='mb-3 text-xs font-medium text-muted-foreground'>Preview</p>

			<div className='flex min-h-0 flex-1 overflow-hidden rounded-xl border bg-background shadow-sm'>
				<nav
					aria-label='Preview pages'
					className='flex w-44 shrink-0 flex-col gap-0.5 border-r bg-muted/40 p-2'
				>
					<div className='mb-2 flex items-center gap-2 px-2 py-1'>
						<span className='flex size-5 items-center justify-center rounded text-xs'>
							🏠
						</span>
						<span className='truncate text-xs font-medium'>
							{workspaceName}
						</span>
					</div>

					{pages.map((item, index) => (
						<button
							key={item.title}
							type='button'
							aria-current={index === pageIndex ? "page" : undefined}
							onClick={() => setPageIndex(index)}
							className={cn(
								"flex items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted",
								index === pageIndex && "bg-muted font-medium text-foreground",
							)}
						>
							<span>{item.icon}</span>
							<span className='truncate'>{item.title}</span>
						</button>
					))}
				</nav>

				<div className='min-w-0 flex-1 overflow-y-auto px-8 py-8'>
					<div className='pointer-events-none select-none'>
						<div className='mb-2 text-4xl'>{page.icon}</div>
						<h1 className='mb-4 text-3xl font-bold'>{page.title}</h1>

						{page.blocks.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								An empty page, ready for anything.
							</p>
						) : (
							<div className='space-y-1'>
								{withListNumbers(page.blocks).map(({ block, number }) => (
									<PreviewBlock key={block.id} block={block} number={number} />
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function withListNumbers(blocks: WorkspaceStarterBlock[]) {
	let counter = 0;

	return blocks.map((block) => {
		counter = block.type === PageBlockType.NUMBERED_LIST ? counter + 1 : 0;
		return { block, number: counter || undefined };
	});
}

function PreviewBlock({
	block,
	number,
}: {
	block: WorkspaceStarterBlock;
	number?: number;
}) {
	switch (block.type) {
		case PageBlockType.HEADER:
			return <ReadOnlyHeadingBlock block={block} />;
		case PageBlockType.TODO:
			return <ReadOnlyTodoBlock block={block} />;
		case PageBlockType.QUOTE:
			return <ReadOnlyQuoteBlock block={block} />;
		case PageBlockType.CALLOUT:
			return <ReadOnlyCalloutBlock block={block} />;
		case PageBlockType.BULLETED_LIST:
			return <ReadOnlyListBlock block={block} />;
		case PageBlockType.NUMBERED_LIST:
			return <ReadOnlyListBlock block={block} number={number} />;
		case PageBlockType.DIVIDER:
			return <Separator className='my-3' />;
		default:
			return <ReadOnlyTextBlock block={block} />;
	}
}
