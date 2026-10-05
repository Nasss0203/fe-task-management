"use client";

import React, { Fragment, useState } from "react";
import {
	BookmarkIcon,
	ChevronDown,
	ChevronRight,
	FileIcon,
	ImageIcon,
	Info,
	VideoIcon,
} from "lucide-react";
import { Separator } from "@/shared/ui/separator";
import type { TemplateBlock } from "@/entities/template";
import { TemplateDatabasePreview } from "./template-database-preview";

export interface TemplateBlockNode extends TemplateBlock {
	children?: TemplateBlockNode[];
}

interface TemplateBlockRendererProps {
	block: TemplateBlockNode;
}

function getContent(block: TemplateBlock): Record<string, unknown> {
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
	return typeof content[key] === "string" ? (content[key] as string) : "";
}

function getBoolean(content: Record<string, unknown>, key: string): boolean {
	return typeof content[key] === "boolean" ? (content[key] as boolean) : false;
}

function ReadOnlyRichText({ text }: { text: string }) {
	const parts = [];
	const linkPattern =
		/\[([^\]]+)]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/|mailto:)[^\s]+)/gi;
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

export function TemplateBlockRenderer({ block }: TemplateBlockRendererProps) {
	const blockType = (block.type || "").toUpperCase();
	const content = getContent(block);
	const text = getString(content, "text") || block.title || "";
	const [isOpen, setIsOpen] = useState(block.is_open ?? true);

	switch (blockType) {
		case "HEADER":
		case "HEADING": {
			const styleConfig = (block.style_config || {}) as Record<string, unknown>;
			const level = styleConfig.level;

			if (level === 2 || level === "2") {
				return (
					<h2 className='min-h-8 mt-5 mb-2 whitespace-pre-wrap text-xl font-semibold leading-7 text-foreground'>
						{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>Heading 2</span>}
					</h2>
				);
			}

			if (level === 3 || level === "3") {
				return (
					<h3 className='min-h-7 mt-4 mb-1.5 whitespace-pre-wrap text-lg font-semibold leading-6 text-foreground'>
						{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>Heading 3</span>}
					</h3>
				);
			}

			return (
				<h1 className='min-h-10 mt-6 mb-3 whitespace-pre-wrap text-2xl font-bold leading-8 tracking-tight text-foreground'>
					{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>Heading 1</span>}
				</h1>
			);
		}

		case "TEXT":
		case "PARAGRAPH": {
			return (
				<p className='min-h-6 my-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground/90'>
					{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/40 italic'>Empty block</span>}
				</p>
			);
		}

		case "TODO": {
			const checked = getBoolean(content, "checked");
			return (
				<div className='flex min-h-6 my-1.5 w-full items-start gap-2.5'>
					<span
						role='checkbox'
						aria-checked={checked}
						aria-disabled='true'
						className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-sm border ${
							checked
								? "border-primary bg-primary text-primary-foreground"
								: "border-border/80 bg-background"
						}`}
					>
						{checked && <span className='text-[10px] leading-none'>✓</span>}
					</span>
					<p
						className={`whitespace-pre-wrap text-sm leading-6 ${
							checked ? "text-muted-foreground line-through" : "text-foreground/90"
						}`}
					>
						{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>To-do</span>}
					</p>
				</div>
			);
		}

		case "TOGGLE": {
			return (
				<div className='w-full my-2'>
					<button
						type='button'
						aria-expanded={isOpen}
						onClick={() => setIsOpen((prev) => !prev)}
						className='flex min-h-7 w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/40'
					>
						<span className='flex size-5 shrink-0 items-center justify-center text-muted-foreground'>
							{isOpen ? (
								<ChevronDown className='size-3.5' />
							) : (
								<ChevronRight className='size-3.5' />
							)}
						</span>
						<p className='text-sm font-medium leading-6 text-foreground/90'>
							{text || <span className='text-muted-foreground/50'>Toggle</span>}
						</p>
					</button>

					{isOpen && block.children && block.children.length > 0 && (
						<div className='ml-6 pl-2 border-l border-border/40 mt-1 space-y-1'>
							{block.children.map((child) => (
								<TemplateBlockRenderer key={child.id} block={child} />
							))}
						</div>
					)}
				</div>
			);
		}

		case "LIST":
		case "BULLETED_LIST": {
			return (
				<div className='flex items-start gap-2.5 my-1 ml-2'>
					<span className='size-1.5 rounded-full bg-foreground/60 mt-2 shrink-0' />
					<p className='text-sm leading-6 text-foreground/90'>
						{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>List item</span>}
					</p>
				</div>
			);
		}

		case "NUMBERED_LIST": {
			return (
				<div className='flex items-start gap-2.5 my-1 ml-2'>
					<span className='text-xs font-mono text-muted-foreground mt-0.5 shrink-0'>
						{block.order_index + 1}.
					</span>
					<p className='text-sm leading-6 text-foreground/90'>
						{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>List item</span>}
					</p>
				</div>
			);
		}

		case "CALLOUT": {
			const icon = (content.icon as string) || "💡";
			return (
				<div className='flex items-start gap-3 my-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5'>
					<span className='text-base shrink-0 select-none'>{icon}</span>
					<div className='text-sm leading-relaxed text-foreground/90'>
						{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>Callout content</span>}
					</div>
				</div>
			);
		}

		case "QUOTE": {
			return (
				<blockquote className='min-h-7 my-3 border-l-4 border-primary/70 pl-4 text-sm italic leading-6 text-foreground/80'>
					{text ? <ReadOnlyRichText text={text} /> : <span className='text-muted-foreground/50'>Quote</span>}
				</blockquote>
			);
		}

		case "CODE": {
			const language = getString(content, "language") || "plaintext";
			return (
				<div className='w-full my-3 overflow-hidden rounded-xl border border-border/70 bg-muted/20'>
					<div className='flex h-8 items-center justify-between border-b border-border/40 px-3 text-[11px] text-muted-foreground bg-muted/40'>
						<span>Code block</span>
						<span className='font-mono uppercase'>{language}</span>
					</div>
					<pre className='overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-foreground/90'>
						<code>{text || "// Empty code block"}</code>
					</pre>
				</div>
			);
		}

		case "DIVIDER": {
			return <Separator className='my-5 border-border/60' />;
		}

		case "TABLE_SIMPLE":
		case "TABLE": {
			const rows = Array.isArray(content.rows)
				? (content.rows as Array<{ id?: string; cells?: Array<{ id?: string; text?: string }> }>)
				: [];

			if (rows.length === 0) {
				return (
					<div className='min-h-10 my-3 rounded-lg border border-border/60 p-3 text-xs text-muted-foreground'>
						Empty table
					</div>
				);
			}

			return (
				<div className='w-full my-3 overflow-x-auto rounded-lg border border-border/70'>
					<table className='w-full border-collapse text-left'>
						<tbody>
							{rows.map((row, rIndex) => (
								<tr key={row.id ?? rIndex} className='border-b border-border/40 last:border-0'>
									{(row.cells || []).map((cell, cIndex) => (
										<td
											key={cell.id ?? cIndex}
											className='h-8 min-w-[140px] px-3 text-xs border-r border-border/40 last:border-0'
										>
											{cell.text || ""}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		case "IMAGE": {
			const url = getString(content, "url");
			const caption = getString(content, "caption");

			if (!url) {
				return (
					<div className='flex min-h-16 items-center gap-2.5 my-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground'>
						<ImageIcon className='size-4' />
						<span>No image preview</span>
					</div>
				);
			}

			return (
				<figure className='w-full my-3'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={url}
						alt={caption || "Template image"}
						className='max-h-[460px] max-w-full rounded-xl object-contain border border-border/50'
					/>
					{caption && (
						<figcaption className='mt-1.5 text-center text-xs text-muted-foreground'>
							{caption}
						</figcaption>
					)}
				</figure>
			);
		}

		case "FILE": {
			const fileName = getString(content, "fileName");
			return (
				<div className='flex items-center gap-3 my-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs'>
					<div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
						<FileIcon className='size-4' />
					</div>
					<div className='min-w-0 flex-1'>
						<p className='truncate font-medium text-foreground/90'>{fileName || "Attached file"}</p>
						<p className='text-[10px] text-muted-foreground'>Read-only attachment</p>
					</div>
				</div>
			);
		}

		case "VIDEO": {
			const url = getString(content, "url");
			return (
				<div className='flex items-center gap-3 my-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground'>
					<VideoIcon className='size-4 text-muted-foreground' />
					<span>{url ? `Video preview: ${url}` : "No video source"}</span>
				</div>
			);
		}

		case "BOOKMARK": {
			const url = getString(content, "url");
			const title = getString(content, "title");
			return (
				<div className='flex items-center gap-3 my-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs'>
					<BookmarkIcon className='size-4 text-primary shrink-0' />
					<div className='min-w-0 flex-1 truncate'>
						<p className='font-medium text-foreground/90 truncate'>{title || url || "Bookmark"}</p>
						{url && <p className='text-[11px] text-muted-foreground truncate'>{url}</p>}
					</div>
				</div>
			);
		}

		case "DATABASE_VIEW": {
			// CRITICAL: Dedicated template database snapshot renderer. Never calls live database APIs.
			return <TemplateDatabasePreview block={block} />;
		}

		default: {
			return (
				<div className='my-2 rounded-lg border border-dashed border-border/50 bg-muted/10 p-2.5 text-xs text-muted-foreground flex items-center gap-2'>
					<Info className='size-3.5 text-muted-foreground/60 shrink-0' />
					<span>Unsupported preview block: {block.type || "UNKNOWN"}</span>
				</div>
			);
		}
	}
}

/**
 * Builds a hierarchical tree from flat template blocks based on parent_block_id and order_index.
 */
export function buildTemplateBlockTree(blocks: TemplateBlock[]): TemplateBlockNode[] {
	if (!blocks || blocks.length === 0) return [];

	const blockMap = new Map<string, TemplateBlockNode>();
	for (const block of blocks) {
		blockMap.set(block.id, { ...block, children: [] });
	}

	const rootNodes: TemplateBlockNode[] = [];

	for (const block of blocks) {
		const node = blockMap.get(block.id)!;
		if (block.parent_block_id && blockMap.has(block.parent_block_id)) {
			const parent = blockMap.get(block.parent_block_id)!;
			parent.children = parent.children || [];
			parent.children.push(node);
		} else {
			rootNodes.push(node);
		}
	}

	const sortTree = (nodes: TemplateBlockNode[]) => {
		nodes.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
		for (const n of nodes) {
			if (n.children && n.children.length > 0) {
				sortTree(n.children);
			}
		}
	};

	sortTree(rootNodes);
	return rootNodes;
}
