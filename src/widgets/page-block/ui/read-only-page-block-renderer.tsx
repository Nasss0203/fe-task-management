"use client";

import {
	BookmarkIcon,
	ChevronDown,
	ChevronRight,
	FileIcon,
	ImageIcon,
	VideoIcon,
} from "lucide-react";
import { Fragment, useState } from "react";

import { getDatabaseViewConfig } from "@/entities/page-block/lib/get-database-view-config";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { Separator } from "@/shared/ui/separator";
import { ReadOnlyDatabaseViewBlock } from "@/widgets/database-view/ui/read-only-database-view-block";

export interface ReadOnlyPageBlockNode {
	id: string;
	type: PageBlockType;
	content: unknown;
	style_config: Record<string, unknown> | null;
	data_config: unknown;
	is_open: boolean;
	children: ReadOnlyPageBlockNode[];
}

interface ReadOnlyPageBlockRendererProps {
	block: ReadOnlyPageBlockNode;
	shareToken?: string;
	disableDatabaseView?: boolean;
}

interface SimpleTableCell {
	id?: string;
	text?: string;
}

interface SimpleTableRow {
	id?: string;
	cells?: SimpleTableCell[];
}

function getContent(block: ReadOnlyPageBlockNode): Record<string, unknown> {
	if (
		block.content &&
		typeof block.content === "object" &&
		!Array.isArray(block.content)
	) {
		return block.content as Record<string, unknown>;
	}

	return {};
}

function getString(content: Record<string, unknown>, key: string): string {
	return typeof content[key] === "string" ? content[key] : "";
}

function getBoolean(content: Record<string, unknown>, key: string): boolean {
	return typeof content[key] === "boolean" ? content[key] : false;
}

function getNumber(content: Record<string, unknown>, key: string): number {
	return typeof content[key] === "number" ? content[key] : 0;
}

function formatFileSize(size: number): string {
	if (size <= 0) return "";
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
	if (size < 1024 * 1024 * 1024) {
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	}

	return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getHostname(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function getYoutubeEmbedUrl(url: string): string | null {
	try {
		const parsedUrl = new URL(url);

		if (parsedUrl.hostname === "youtu.be") {
			const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
			return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
		}

		if (
			parsedUrl.hostname === "youtube.com" ||
			parsedUrl.hostname === "www.youtube.com"
		) {
			if (parsedUrl.pathname === "/watch") {
				const videoId = parsedUrl.searchParams.get("v");
				return videoId
					? `https://www.youtube.com/embed/${videoId}`
					: null;
			}

			if (parsedUrl.pathname.startsWith("/embed/")) return url;

			if (parsedUrl.pathname.startsWith("/shorts/")) {
				const videoId = parsedUrl.pathname
					.split("/")
					.filter(Boolean)[1];
				return videoId
					? `https://www.youtube.com/embed/${videoId}`
					: null;
			}
		}
	} catch {
		return null;
	}

	return null;
}

function isDirectVideoUrl(url: string): boolean {
	try {
		const pathname = new URL(url).pathname.toLowerCase();
		return [".mp4", ".webm", ".ogg"].some((extension) =>
			pathname.endsWith(extension),
		);
	} catch {
		return false;
	}
}

function EmptyValue({ children }: { children: string }) {
	return (
		<span className='text-muted-foreground/50' aria-hidden='true'>
			{children}
		</span>
	);
}

function ReadOnlyTextBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const text = getString(getContent(block), "text");

	return (
		<p className='min-h-7 whitespace-pre-wrap text-base leading-7'>
			{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>Empty text</EmptyValue>}
		</p>
	);
}

function ReadOnlyHeadingBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const text = getString(getContent(block), "text");
	const styleConfig = block.style_config ?? {};
	const level = styleConfig.level;

	if (level === 2 || level === "2") {
		return (
			<h2 className='min-h-8 whitespace-pre-wrap text-2xl font-semibold leading-8'>
				{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>Heading 2</EmptyValue>}
			</h2>
		);
	}

	if (level === 3 || level === "3") {
		return (
			<h3 className='min-h-7 whitespace-pre-wrap text-xl font-semibold leading-7'>
				{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>Heading 3</EmptyValue>}
			</h3>
		);
	}

	return (
		<h1 className='min-h-10 whitespace-pre-wrap text-3xl font-bold leading-10'>
			{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>Heading 1</EmptyValue>}
		</h1>
	);
}

function ReadOnlyTodoBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const text = getString(content, "text");
	const checked = getBoolean(content, "checked");

	return (
		<div className='flex min-h-7 w-full items-start gap-2'>
			<span
				role='checkbox'
				aria-checked={checked}
				aria-disabled='true'
				className={`mt-[6px] flex size-4 shrink-0 items-center justify-center rounded-sm border ${
					checked
						? "border-primary bg-primary text-primary-foreground"
						: ""
				}`}
			>
				{checked && <span className='text-[10px] leading-none'>✓</span>}
			</span>
			<p
				className={`whitespace-pre-wrap text-base leading-7 ${
					checked ? "text-muted-foreground line-through" : ""
				}`}
			>
				{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>To-do</EmptyValue>}
			</p>
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

function ReadOnlyQuoteBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const text = getString(getContent(block), "text");

	return (
		<blockquote className='min-h-7 border-l-4 border-foreground/70 pl-4 text-base italic leading-7'>
			{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>Quote</EmptyValue>}
		</blockquote>
	);
}

function ReadOnlyCodeBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const text = getString(content, "text");
	const language = getString(content, "language") || "plaintext";

	return (
		<div className='w-full overflow-hidden rounded-lg border bg-muted/20'>
			<div className='flex h-9 items-center justify-end px-3 text-xs text-muted-foreground'>
				{language}
			</div>
			<pre className='min-h-10 overflow-x-auto whitespace-pre-wrap px-4 pb-3 font-mono text-sm'>
				<code>{text}</code>
			</pre>
		</div>
	);
}

function ReadOnlySimpleTableBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const rows = Array.isArray(content.rows)
		? (content.rows as SimpleTableRow[])
		: [];
	const hasHeaderRow = getBoolean(content, "hasHeaderRow");
	const hasHeaderColumn = getBoolean(content, "hasHeaderColumn");

	if (rows.length === 0) {
		return (
			<div className='min-h-10 rounded-md border p-3 text-sm text-muted-foreground'>
				Empty table
			</div>
		);
	}

	return (
		<div className='w-full overflow-x-auto'>
			<table className='w-full border-collapse'>
				<tbody>
					{rows.map((row, rowIndex) => {
						const cells = Array.isArray(row.cells) ? row.cells : [];

						return (
							<tr key={row.id ?? rowIndex}>
								{cells.map((cell, columnIndex) => {
									const isHeader =
										(hasHeaderRow && rowIndex === 0) ||
										(hasHeaderColumn && columnIndex === 0);

									return (
										<td
											key={cell.id ?? columnIndex}
											className={`h-9 min-w-[160px] border border-border px-2 text-sm ${
												isHeader
													? "bg-muted/40 font-semibold"
													: ""
											}`}
										>
											{typeof cell.text === "string"
												? cell.text
												: ""}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function ReadOnlyImageBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const url = getString(content, "url");
	const caption = getString(content, "caption");

	if (!url) {
		return (
			<div className='flex min-h-14 items-center gap-3 rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground'>
				<ImageIcon className='size-4' />
				No image
			</div>
		);
	}

	return (
		<figure className='w-full'>
			{/* External and uploaded block URLs can use arbitrary hosts. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={url}
				alt={caption}
				className='max-h-[520px] max-w-full rounded-md object-contain'
			/>
			{caption && (
				<figcaption className='mt-1 text-center text-xs text-muted-foreground'>
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

function ReadOnlyFileBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const fileName = getString(content, "fileName");
	const size = formatFileSize(getNumber(content, "size"));

	return (
		<div className='flex min-h-14 w-full items-center gap-3 rounded-md border p-3'>
			<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
				<FileIcon className='size-4 text-muted-foreground' />
			</div>
			<div className='min-w-0 flex-1'>
				<p className='truncate text-sm font-medium'>
					{fileName || "No file"}
				</p>
				{size && (
					<p className='text-xs text-muted-foreground'>{size}</p>
				)}
			</div>
		</div>
	);
}

function ReadOnlyVideoBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const url = getString(content, "url");
	const fileName = getString(content, "fileName");
	const attachmentId = getString(content, "attachmentId");
	const caption = getString(content, "caption");
	const youtubeEmbedUrl = url ? getYoutubeEmbedUrl(url) : null;

	return (
		<figure className='w-full'>
			{youtubeEmbedUrl ? (
				<div className='aspect-video w-full max-w-3xl overflow-hidden rounded-md'>
					<iframe
						src={youtubeEmbedUrl}
						title={caption || "YouTube video"}
						className='size-full border-0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
						allowFullScreen
					/>
				</div>
			) : url && isDirectVideoUrl(url) ? (
				<video
					src={url}
					controls
					className='max-h-[520px] max-w-full rounded-md'
				/>
			) : (
				<div className='flex min-h-14 items-center gap-3 rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground'>
					<VideoIcon className='size-4' />
					{attachmentId ? fileName || "Attached video" : "No video"}
				</div>
			)}
			{caption && (
				<figcaption className='mt-1 text-center text-xs text-muted-foreground'>
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

function ReadOnlyBookmarkBlock({ block }: ReadOnlyPageBlockRendererProps) {
	const content = getContent(block);
	const url = getString(content, "url");
	const title = getString(content, "title");
	const description = getString(content, "description");
	const siteName = getString(content, "siteName");
	const imageUrl = getString(content, "imageUrl");

	if (!url) {
		return (
			<div className='flex min-h-14 items-center gap-3 rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground'>
				<BookmarkIcon className='size-4' />
				No bookmark
			</div>
		);
	}

	return (
		<a
			href={url}
			target='_blank'
			rel='noopener noreferrer'
			className='group flex w-full max-w-3xl overflow-hidden rounded-md border border-border transition-colors hover:bg-muted/30'
		>
			<div className='min-w-0 flex flex-1 flex-col justify-between p-3'>
				<div className='min-w-0'>
					<p className='line-clamp-2 text-sm font-medium'>
						{title || getHostname(url)}
					</p>
					{description && (
						<p className='mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground'>
							{description}
						</p>
					)}
				</div>
				<p className='mt-3 truncate text-xs text-muted-foreground'>
					{siteName || getHostname(url)}
				</p>
			</div>
			{imageUrl && (
				<div className='w-40 shrink-0 border-l'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={imageUrl}
						alt=''
						className='h-full min-h-28 w-full object-cover'
					/>
				</div>
			)}
		</a>
	);
}

function ReadOnlyRichText({ text }: { text: string }) {
	const parts = [];
	const linkPattern = /\[([^\]]+)]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/|mailto:)[^\s]+)/gi;
	let previousIndex = 0;

	for (const match of text.matchAll(linkPattern)) {
		const matchIndex = match.index;
		if (matchIndex > previousIndex) {
			parts.push(text.slice(previousIndex, matchIndex));
		}

		const href = match[2] ?? match[3];
		const label = match[1] ?? href;
		parts.push(
			<a
				key={`${matchIndex}-${href}`}
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className='text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary'
			>
				{label}
			</a>,
		);
		previousIndex = matchIndex + match[0].length;
	}

	if (previousIndex < text.length) {
		parts.push(text.slice(previousIndex));
	}

	return <Fragment>{parts}</Fragment>;
}

export function ReadOnlyPageBlockRenderer({
	block,
	shareToken,
	disableDatabaseView = false,
}: ReadOnlyPageBlockRendererProps) {
	switch (block.type) {
		case PageBlockType.TEXT:
			return <ReadOnlyTextBlock block={block} />;
		case PageBlockType.HEADER:
			return <ReadOnlyHeadingBlock block={block} />;
		case PageBlockType.DIVIDER:
			return <Separator className='w-full' />;
		case PageBlockType.TODO:
			return <ReadOnlyTodoBlock block={block} />;
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
				return (
					<div className='rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
						Database views are not available on public pages.
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
