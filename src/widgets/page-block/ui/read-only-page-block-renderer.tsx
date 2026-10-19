"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { EMBED_BLOCK_TYPES } from "@/entities/page-block/lib/resolve-embed";
import type { TocHeading } from "@/entities/page-block/lib/assign-toc-headings";
import { getDatabaseViewConfig } from "@/entities/page-block/lib/get-database-view-config";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	getContent,
	getString,
	ReadOnlyTextBlock,
	ReadOnlyHeadingBlock,
	ReadOnlyTodoBlock,
	ReadOnlyQuoteBlock,
	ReadOnlyCodeBlock,
	ReadOnlySimpleTableBlock,
	ReadOnlyImageBlock,
	ReadOnlyFileBlock,
	ReadOnlyVideoBlock,
	ReadOnlyBookmarkBlock,
	ReadOnlyCalloutBlock,
	ReadOnlyEmbedBlock,
	ReadOnlyListBlock,
	ReadOnlyMermaidBlock,
	TableOfContentsBlock,
	EmptyValue,
} from "@/entities/page-block/ui/read-only-block-content";
import { Separator } from "@/shared/ui/separator";
import type { PublicDatabase } from "@/entities/public-site/model/public-site.types";
import {
	ReadOnlyDatabaseTable,
	ReadOnlyDatabaseViewBlock,
} from "@/widgets/database-view/ui/read-only-database-view-block";

export interface ReadOnlyPageBlockNode {
	id: string;
	type: PageBlockType;
	content: unknown;
	style_config: Record<string, unknown> | null;
	data_config: unknown;
	is_open: boolean;
	children: ReadOnlyPageBlockNode[];
	list_number?: number;
	toc_headings?: TocHeading[];
	/** Snapshot sent by public pages, rendered without fetching. */
	database?: PublicDatabase | null;
}

interface ReadOnlyPageBlockRendererProps {
	block: ReadOnlyPageBlockNode;
	shareToken?: string;
	disableDatabaseView?: boolean;
}

function ReadOnlyToggleBlock({
	block,
	shareToken,
	disableDatabaseView,
}: ReadOnlyPageBlockRendererProps) {
	const text = getString(getContent(block), "text");
	const [isOpen, setIsOpen] = useState(block.is_open);

	return (
		<div className='w-full'>
			<button
				type='button'
				aria-expanded={isOpen}
				aria-controls={`toggle-children-${block.id}`}
				className='flex min-h-7 w-full items-start rounded-sm text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
				onClick={() => setIsOpen((current) => !current)}
			>
				<span className='flex size-7 shrink-0 items-center justify-center text-muted-foreground'>
					{isOpen ? (
						<ChevronDown className='size-4' />
					) : (
						<ChevronRight className='size-4' />
					)}
				</span>

				<p className='min-h-7 whitespace-pre-wrap text-base leading-7'>
					{text || <EmptyValue>Toggle</EmptyValue>}
				</p>
			</button>

			{isOpen && block.children.length > 0 && (
				<div id={`toggle-children-${block.id}`} className='ml-7 pl-2'>
					{block.children.map((child) => (
						<ReadOnlyPageBlockRenderer
							key={child.id}
							block={child}
							shareToken={shareToken}
							disableDatabaseView={disableDatabaseView}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function ReadOnlyPageBlockRenderer({
	block,
	shareToken,
	disableDatabaseView = false,
}: ReadOnlyPageBlockRendererProps) {
	if (EMBED_BLOCK_TYPES.includes(block.type)) {
		return <ReadOnlyEmbedBlock block={block} />;
	}

	switch (block.type) {
		case PageBlockType.TEXT:
			return <ReadOnlyTextBlock block={block} />;
		case PageBlockType.HEADER:
			return (
				<ReadOnlyHeadingBlock block={block} anchorId={`block-${block.id}`} />
			);
		case PageBlockType.DIVIDER:
			return <Separator className='w-full' />;
		case PageBlockType.TODO:
			return <ReadOnlyTodoBlock block={block} />;
		case PageBlockType.BULLETED_LIST:
		case PageBlockType.NUMBERED_LIST:
			return (
				<ReadOnlyListBlock block={block} number={block.list_number} />
			);
		case PageBlockType.CALLOUT:
			return <ReadOnlyCalloutBlock block={block} />;
		case PageBlockType.TABLE_OF_CONTENTS:
			return <TableOfContentsBlock headings={block.toc_headings ?? []} />;
		case PageBlockType.MERMAID:
			return <ReadOnlyMermaidBlock block={block} />;
		case PageBlockType.TOGGLE:
			return (
				<ReadOnlyToggleBlock
					block={block}
					shareToken={shareToken}
					disableDatabaseView={disableDatabaseView}
				/>
			);
		case PageBlockType.QUOTE:
			return <ReadOnlyQuoteBlock block={block} />;
		case PageBlockType.CODE:
			return <ReadOnlyCodeBlock block={block} />;
		case PageBlockType.TABLE_SIMPLE:
			return <ReadOnlySimpleTableBlock block={block} />;
		case PageBlockType.IMAGE:
			return <ReadOnlyImageBlock block={block} />;
		case PageBlockType.FILE:
			return <ReadOnlyFileBlock block={block} />;
		case PageBlockType.VIDEO:
			return <ReadOnlyVideoBlock block={block} />;
		case PageBlockType.BOOKMARK:
			return <ReadOnlyBookmarkBlock block={block} />;
		case PageBlockType.DATABASE_VIEW: {
			if (disableDatabaseView) {
				if (block.database) {
					return (
						<ReadOnlyDatabaseTable
							viewName={block.database.view.name}
							properties={block.database.properties}
							viewProperties={block.database.view.properties}
							rows={block.database.rows}
						/>
					);
				}

				return (
					<div className='rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
						This database is not available.
					</div>
				);
			}

			const config = getDatabaseViewConfig(block);

			if (!config) {
				return (
					<div className='text-sm text-destructive'>
						Invalid database view configuration
					</div>
				);
			}

			return (
				<ReadOnlyDatabaseViewBlock
					databaseId={config.database_id}
					viewId={config.view_id}
					shareToken={shareToken}
				/>
			);
		}
		default:
			return (
				<div className='min-h-7 text-sm text-muted-foreground'>
					Unsupported block: {block.type}
				</div>
			);
	}
}
