import type { TocHeading } from "@/entities/page-block/lib/assign-toc-headings";
import {
	type InlineNode,
	parseInlineMarks,
} from "@/entities/page-block/lib/parse-inline-marks";
import { resolveEmbed, type ResolvedEmbed } from "@/entities/page-block/lib/resolve-embed";
import type { PageMentionTitles } from "@/entities/page/model/page.types";
import { canInteract, InteractionMode } from "@/shared/model/interaction-mode";
import { MermaidDiagram } from "@/shared/ui/mermaid-diagram";
import { NativeCheckbox } from "@/shared/ui/native-checkbox";
import { BookmarkIcon, FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import { Fragment } from "react";

import { PageMentionChip } from "./page-mention-chip";

interface BlockContentProps {
	block: { content: unknown; style_config: Record<string, unknown> | null };
}

interface SimpleTableCell {
	id?: string;
	text?: string;
}

interface SimpleTableRow {
	id?: string;
	cells?: SimpleTableCell[];
}

interface TodoBlockContentProps extends BlockContentProps {
	mode?: InteractionMode;
	onCheckedChange?: (checked: boolean) => void;
}

export function getContent(
	block: BlockContentProps["block"],
): Record<string, unknown> {
	if (
		block.content &&
		typeof block.content === "object" &&
		!Array.isArray(block.content)
	) {
		return block.content as Record<string, unknown>;
	}

	return {};
}

export function getString(
	content: Record<string, unknown>,
	key: string,
): string {
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

export function EmptyValue({ children }: { children: string }) {
	return (
		<span className='text-muted-foreground/50' aria-hidden='true'>
			{children}
		</span>
	);
}

export function ReadOnlyTextBlock({ block }: BlockContentProps) {
	const text = getString(getContent(block), "text");

	return (
		<p className='min-h-6 whitespace-pre-wrap text-[15px] leading-6 text-secondary-foreground dark:text-foreground'>
			{text ? (
				<ReadOnlyRichText text={text} />
			) : (
				<EmptyValue>Empty text</EmptyValue>
			)}
		</p>
	);
}

export function ReadOnlyHeadingBlock({
	block,
	anchorId,
}: BlockContentProps & { anchorId?: string }) {
	const text = getString(getContent(block), "text");
	const styleConfig = block.style_config ?? {};
	const level = styleConfig.level;

	if (level === 2 || level === "2") {
		return (
			<h2 id={anchorId} className='min-h-8 whitespace-pre-wrap text-[23px] font-semibold leading-8'>
				{text ? (
					<ReadOnlyRichText text={text} />
				) : (
					<EmptyValue>Heading 2</EmptyValue>
				)}
			</h2>
		);
	}

	if (level === 3 || level === "3") {
		return (
			<h3 id={anchorId} className='min-h-7 whitespace-pre-wrap text-[19px] font-semibold leading-7'>
				{text ? (
					<ReadOnlyRichText text={text} />
				) : (
					<EmptyValue>Heading 3</EmptyValue>
				)}
			</h3>
		);
	}

	return (
		<h1 id={anchorId} className='min-h-[38px] whitespace-pre-wrap text-[30px] font-bold leading-[38px]'>
			{text ? (
				<ReadOnlyRichText text={text} />
			) : (
				<EmptyValue>Heading 1</EmptyValue>
			)}
		</h1>
	);
}

export function ReadOnlyTodoBlock({
	block,
	mode = "readonly",
	onCheckedChange,
}: TodoBlockContentProps) {
	const content = getContent(block);
	const text = getString(content, "text");
	const checked = getBoolean(content, "checked");

	const interactive = canInteract(mode) && Boolean(onCheckedChange);

	return (
		<div className='flex min-h-6 w-full items-start gap-2.5'>
			<NativeCheckbox
				checked={checked}
				readOnly={!interactive}
				onChange={
					interactive
						? (event) => onCheckedChange?.(event.target.checked)
						: undefined
				}
				aria-label={text || "To-do"}
				className={`mt-1 shrink-0 ${
					interactive ? "cursor-pointer" : ""
				}`}
			/>

			<p
				className={`whitespace-pre-wrap text-[15px] leading-6 ${
					checked ? "text-faint line-through" : "text-secondary-foreground dark:text-foreground"
				}`}
			>
				{text ? (
					<ReadOnlyRichText text={text} />
				) : (
					<EmptyValue>To-do</EmptyValue>
				)}
			</p>
		</div>
	);
}

export function ReadOnlyQuoteBlock({ block }: BlockContentProps) {
	const text = getString(getContent(block), "text");

	return (
		<blockquote className='min-h-[26px] border-l-[3px] border-foreground pl-3.5 text-base leading-[26px] text-secondary-foreground'>
			{text ? (
				<ReadOnlyRichText text={text} />
			) : (
				<EmptyValue>Quote</EmptyValue>
			)}
		</blockquote>
	);
}

export function ReadOnlyCodeBlock({ block }: BlockContentProps) {
	const content = getContent(block);
	const text = getString(content, "text");
	const language = getString(content, "language") || "plaintext";

	return (
		<div className='w-full overflow-hidden rounded-lg border border-border bg-[#f6f6f5] dark:bg-[#232220]'>
			<div className='flex items-center border-b border-border px-3 py-2 text-xs leading-4 text-muted-foreground'>
				{language}
			</div>
			<pre className='min-h-10 overflow-x-auto whitespace-pre-wrap px-3.5 py-3 font-mono text-[13px] leading-[21px]'>
				<code>{text}</code>
			</pre>
		</div>
	);
}

export function ReadOnlySimpleTableBlock({ block }: BlockContentProps) {
	const content = getContent(block);
	const rows = Array.isArray(content.rows)
		? (content.rows as SimpleTableRow[])
		: [];
	const hasHeaderRow = getBoolean(content, "hasHeaderRow");
	const hasHeaderColumn = getBoolean(content, "hasHeaderColumn");

	if (rows.length === 0) {
		return (
			<div className='min-h-10 rounded-md border border-border p-3 text-sm text-muted-foreground'>
				Empty table
			</div>
		);
	}

	return (
		<div className='w-full overflow-x-auto rounded-lg border border-border'>
			<table className='w-full border-collapse'>
				<tbody>
					{rows.map((row, rowIndex) => {
						const cells = Array.isArray(row.cells) ? row.cells : [];

						return (
							<tr key={row.id ?? rowIndex} className='[&:last-child>td]:border-b-0'>
								{cells.map((cell, columnIndex) => {
									const isHeader =
										(hasHeaderRow && rowIndex === 0) ||
										(hasHeaderColumn && columnIndex === 0);

									return (
										<td
											key={cell.id ?? columnIndex}
											className={`${hasHeaderRow && rowIndex === 0 ? "h-[34px]" : "h-[38px]"} min-w-[160px] border-b border-r border-border px-3 text-[13.5px] leading-5 text-foreground last:border-r-0 ${
												isHeader
													? "bg-[#fbfbfa] font-medium dark:bg-muted/40"
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

export function ReadOnlyImageBlock({ block }: BlockContentProps) {
	const content = getContent(block);
	const url = getString(content, "url");
	const caption = getString(content, "caption");

	if (!url) {
		return (
			<div className='flex min-h-14 items-center gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
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

export function ReadOnlyFileBlock({ block }: BlockContentProps) {
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

export function ReadOnlyVideoBlock({ block }: BlockContentProps) {
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
				<div className='flex min-h-14 items-center gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
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

export function ReadOnlyBookmarkBlock({ block }: BlockContentProps) {
	const content = getContent(block);
	const url = getString(content, "url");
	const title = getString(content, "title");
	const description = getString(content, "description");
	const siteName = getString(content, "siteName");
	const imageUrl = getString(content, "imageUrl");

	if (!url) {
		return (
			<div className='flex min-h-14 items-center gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
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

export function ReadOnlyRichText({
	text,
	pageTitles,
}: {
	text: string;
	pageTitles?: Partial<PageMentionTitles>;
}) {
	return <InlineNodes nodes={parseInlineMarks(text)} pageTitles={pageTitles} />;
}

function InlineNodes({
	nodes,
	pageTitles,
}: {
	nodes: InlineNode[];
	pageTitles?: Partial<PageMentionTitles>;
}) {
	return (
		<Fragment>
			{nodes.map((node, index) => {
				switch (node.type) {
					case "text":
						return <Fragment key={index}>{node.text}</Fragment>;
					case "code":
						return (
							<code
								key={index}
								className='rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-destructive'
							>
								{node.text}
							</code>
						);
					case "bold":
						return (
							<strong key={index} className='font-semibold'>
								<InlineNodes nodes={node.children} pageTitles={pageTitles} />
							</strong>
						);
					case "italic":
						return (
							<em key={index}>
								<InlineNodes nodes={node.children} pageTitles={pageTitles} />
							</em>
						);
					case "strike":
						return (
							<s key={index}>
								<InlineNodes nodes={node.children} pageTitles={pageTitles} />
							</s>
						);
					case "mention":
						return (
							<span
								key={index}
								className='rounded-sm bg-accent-soft px-0.5 font-medium text-ring'
							>
								@{node.name}
							</span>
						);
					case "page-mention":
						return (
							<PageMentionChip
								key={index}
								pageId={node.pageId}
								pageTitles={pageTitles}
							/>
						);
					case "link":
						return (
							<a
								key={index}
								href={node.href}
								target='_blank'
								rel='noopener noreferrer'
								className='text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary'
							>
								<InlineNodes nodes={node.children} pageTitles={pageTitles} />
							</a>
						);
				}
			})}
		</Fragment>
	);
}

export const CALLOUT_TONES = {
	default: { label: "Note", icon: "💡", className: "bg-muted" },
	info: { label: "Info", icon: "ℹ️", className: "bg-accent-soft" },
	success: { label: "Success", icon: "✅", className: "bg-success/10" },
	warning: { label: "Warning", icon: "⚠️", className: "bg-[#fbf3db] dark:bg-[#3a3220]" },
	danger: { label: "Danger", icon: "🚫", className: "bg-[#fdecec] dark:bg-danger/15" },
} as const;

export type CalloutTone = keyof typeof CALLOUT_TONES;

export function getCalloutTone(
	styleConfig: Record<string, unknown> | null,
): CalloutTone {
	const tone = styleConfig?.tone;

	return typeof tone === "string" && tone in CALLOUT_TONES
		? (tone as CalloutTone)
		: "default";
}

export function getCalloutIcon(block: BlockContentProps["block"]): string {
	return (
		getString(getContent(block), "icon") ||
		CALLOUT_TONES[getCalloutTone(block.style_config)].icon
	);
}

export function ListMarker({ number }: { number?: number }) {
	return (
		<span
			aria-hidden='true'
			className='flex h-6 min-w-6 shrink-0 select-none items-center justify-center text-[15px] leading-6'
		>
			{number ? `${number}.` : "•"}
		</span>
	);
}

export function ReadOnlyListBlock({
	block,
	number,
}: BlockContentProps & { number?: number }) {
	const text = getString(getContent(block), "text");

	return (
		<div className='flex min-h-6 w-full items-start gap-1'>
			<ListMarker number={number} />

			<p className='min-w-0 flex-1 whitespace-pre-wrap text-[15px] leading-6 text-secondary-foreground dark:text-foreground'>
				{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>List</EmptyValue>}
			</p>
		</div>
	);
}

export function ReadOnlyCalloutBlock({ block }: BlockContentProps) {
	const text = getString(getContent(block), "text");
	const tone = CALLOUT_TONES[getCalloutTone(block.style_config)];

	return (
		<div className={`flex w-full items-start gap-3 rounded-lg px-4 py-3.5 ${tone.className}`}>
			<span aria-hidden='true' className='text-lg leading-6'>
				{getCalloutIcon(block)}
			</span>

			<p className='min-w-0 flex-1 whitespace-pre-wrap text-[15px] leading-6 text-secondary-foreground dark:text-foreground'>
				{text ? <ReadOnlyRichText text={text} /> : <EmptyValue>Callout</EmptyValue>}
			</p>
		</div>
	);
}

export function EmbedFrame({
	embed,
	title,
}: {
	embed: ResolvedEmbed;
	title: string;
}) {
	return (
		<div className='w-full max-w-3xl overflow-hidden rounded-md border'>
			<iframe
				title={title}
				src={embed.src}
				srcDoc={embed.srcDoc}
				height={embed.height}
				loading='lazy'
				referrerPolicy='strict-origin-when-cross-origin'
				sandbox={
					embed.srcDoc
						? "allow-scripts allow-popups allow-popups-to-escape-sandbox"
						: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
				}
				allowFullScreen
				className='block w-full border-0 bg-background'
			/>
		</div>
	);
}

export function ReadOnlyEmbedBlock({ block }: BlockContentProps) {
	const url = getString(getContent(block), "url");
	const embed = url ? resolveEmbed(url) : null;

	if (!url) {
		return <EmptyValue>Embed</EmptyValue>;
	}

	if (!embed) {
		return (
			<div className='rounded-md border border-dashed border-input p-3 text-sm text-muted-foreground'>
				This embed link is not supported.
			</div>
		);
	}

	return <EmbedFrame embed={embed} title={getHostname(url)} />;
}

export function ReadOnlyMermaidBlock({ block }: BlockContentProps) {
	const text = getString(getContent(block), "text");

	return text.trim() ? <MermaidDiagram code={text} /> : <EmptyValue>Mermaid diagram</EmptyValue>;
}

const TOC_INDENT = { 1: "pl-0", 2: "pl-4", 3: "pl-8" } as const;

export function TableOfContentsBlock({ headings }: { headings: TocHeading[] }) {
	const visible = headings.filter((heading) => heading.text.trim());

	if (visible.length === 0) {
		return (
			<p className='min-h-7 text-sm leading-7 text-muted-foreground'>
				Add headings to this page to build a table of contents.
			</p>
		);
	}

	return (
		<nav aria-label='Table of contents' className='w-full'>
			<ul className='space-y-1'>
				{visible.map((heading) => (
					<li
						key={heading.id}
						className={TOC_INDENT[heading.level as keyof typeof TOC_INDENT]}
					>
						<a
							href={`#block-${heading.id}`}
							onClick={(event) => {
								const target = document.getElementById(`block-${heading.id}`);

								if (!target) return;

								event.preventDefault();
								target.scrollIntoView({ behavior: "smooth", block: "start" });
							}}
							className='block truncate rounded-sm text-sm leading-[22px] text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
