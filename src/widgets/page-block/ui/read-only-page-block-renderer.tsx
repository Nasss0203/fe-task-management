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
	CALLOUT_TONES,
	getCalloutTone,
} from "@/entities/page-block/ui/read-only-block-content";
import { Separator } from "@/shared/ui/separator";
import { columnRatio } from "@/widgets/page-block-renderer/lib/column-widths";
import { getSectionForm } from "@/widgets/page-block-renderer/lib/form-config";
import { FormFill, useFormDatabase } from "@/widgets/page-block-renderer/ui/form-fill";
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

function ReadOnlySectionBlock({
	block,
	shareToken,
	disableDatabaseView,
}: ReadOnlyPageBlockRendererProps) {
	const [isOpen, setIsOpen] = useState(block.is_open);
	const form = getSectionForm(block.data_config);
	const { data: formDatabase, isError: formUnavailable } = useFormDatabase(
		block,
		form,
		shareToken,
	);
	const renderChild = (child: ReadOnlyPageBlockNode) => (
		<ReadOnlyPageBlockRenderer
			block={child}
			shareToken={shareToken}
			disableDatabaseView={disableDatabaseView}
		/>
	);
	const title = getString(getContent(block), "title");
	const description = getString(getContent(block), "description");

	if (form && formDatabase) {
		return (
			<section
				aria-label={title || "Form"}
				className={`w-full rounded-xl border border-border/60 px-4 py-8 sm:px-8 ${CALLOUT_TONES[getCalloutTone(block.style_config)].className}`}
			>
				<div className='mx-auto mb-6 max-w-xl'>
					{title && <h2 className='text-xl font-semibold'>{title}</h2>}
					{description && (
						<p className='mt-1 text-sm leading-6 text-muted-foreground'>
							{description}
						</p>
					)}
				</div>
				<div data-read-only-allowed>
					<FormFill
						section={block}
						form={form}
						database={formDatabase}
						shareToken={shareToken}
						renderBlock={(child) => renderChild(child as ReadOnlyPageBlockNode)}
					/>
				</div>
			</section>
		);
	}

	return (
		<section
			aria-label={title || "Untitled section"}
			className={`w-full rounded-lg border border-border/60 px-3 py-2 ${CALLOUT_TONES[getCalloutTone(block.style_config)].className}`}
		>
			<button
				type='button'
				aria-expanded={isOpen}
				aria-controls={`section-children-${block.id}`}
				onClick={() => setIsOpen((current) => !current)}
				className='flex min-h-7 w-full items-center gap-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
			>
				<span className='flex size-7 shrink-0 items-center justify-center text-muted-foreground'>
					{isOpen ? (
						<ChevronDown className='size-4' />
					) : (
						<ChevronRight className='size-4' />
					)}
				</span>
				<span className='min-w-0 flex-1 text-base font-semibold leading-7'>
					{title || <EmptyValue>Untitled section</EmptyValue>}
				</span>
				{!isOpen && block.children.length > 0 && (
					<span className='shrink-0 text-xs text-muted-foreground'>
						{block.children.length}{" "}
						{block.children.length === 1 ? "block" : "blocks"}
					</span>
				)}
			</button>

			{isOpen && (
				<div id={`section-children-${block.id}`}>
					{description && (
						<p className='ml-8 text-sm leading-6 text-muted-foreground'>
							{description}
						</p>
					)}
					{form && formUnavailable && (
						<p className='ml-8 mt-1 text-[13.5px] text-destructive'>
							This form is not available right now.
						</p>
					)}
					<div className='ml-8 mt-1'>
						{block.children.map((child) => (
							<div
								key={child.id}
								id={`block-${child.id}`}
								className='rounded-md transition-colors duration-500'
							>
								<ReadOnlyPageBlockRenderer
									block={child}
									shareToken={shareToken}
									disableDatabaseView={disableDatabaseView}
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</section>
	);
}

/** Columns side by side (stacked on a phone), with no borders or handles. */
function ReadOnlyColumnList({
	block,
	shareToken,
	disableDatabaseView,
}: ReadOnlyPageBlockRendererProps) {
	const columns = block.children;

	return (
		<div className='flex w-full flex-col gap-x-8 md:flex-row'>
			{columns.map((column) => (
				<div
					key={column.id}
					className='min-w-0'
					style={{ flex: `${columnRatio(column, columns.length)} 1 0%` }}
				>
					{column.children.map((child) => (
						<div
							key={child.id}
							id={`block-${child.id}`}
							className='rounded-md transition-colors duration-500'
						>
							<ReadOnlyPageBlockRenderer
								block={child}
								shareToken={shareToken}
								disableDatabaseView={disableDatabaseView}
							/>
						</div>
					))}
				</div>
			))}
		</div>
	);
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
				className='flex min-h-6 w-full items-start rounded-sm text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
				onClick={() => setIsOpen((current) => !current)}
			>
				<span className='flex h-6 w-[22px] shrink-0 items-center text-muted-foreground'>
					{isOpen ? (
						<ChevronDown className='size-4' />
					) : (
						<ChevronRight className='size-4' />
					)}
				</span>

				<p className='min-h-6 whitespace-pre-wrap text-[15px] font-medium leading-6'>
					{text || <EmptyValue>Toggle</EmptyValue>}
				</p>
			</button>

			{isOpen && block.children.length > 0 && (
				<div id={`toggle-children-${block.id}`} className='pl-[22px]'>
					{block.children.map((child) => (
						<div
							key={child.id}
							id={`block-${child.id}`}
							className='rounded-md transition-colors duration-500'
						>
							<ReadOnlyPageBlockRenderer
								block={child}
								shareToken={shareToken}
								disableDatabaseView={disableDatabaseView}
							/>
						</div>
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
		// Questions only exist inside FormFill: without the form there is nothing to show.
		case PageBlockType.FORM_FIELD:
			return null;
		case PageBlockType.SECTION:
			return (
				<ReadOnlySectionBlock
					block={block}
					shareToken={shareToken}
					disableDatabaseView={disableDatabaseView}
				/>
			);
		case PageBlockType.COLUMN_LIST:
			return (
				<ReadOnlyColumnList
					block={block}
					shareToken={shareToken}
					disableDatabaseView={disableDatabaseView}
				/>
			);
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
					<div className='rounded-md border border-dashed border-input p-3 text-sm text-muted-foreground'>
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
