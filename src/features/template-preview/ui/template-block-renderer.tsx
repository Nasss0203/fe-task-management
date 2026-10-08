import {
	ReadOnlyBookmarkBlock,
	ReadOnlyCodeBlock,
	ReadOnlyFileBlock,
	ReadOnlyHeadingBlock,
	ReadOnlyImageBlock,
	ReadOnlyQuoteBlock,
	ReadOnlyRichText,
	ReadOnlySimpleTableBlock,
	ReadOnlyTextBlock,
	ReadOnlyTodoBlock,
	ReadOnlyVideoBlock,
} from "@/entities/page-block/ui/read-only-block-content";
import type {
	TemplateBlock,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import { Separator } from "@/shared/ui/separator";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { TemplatePreviewInteractions } from "../model/template-preview-interactions";
import { TemplateDatabasePreview } from "./template-database-preview";

export interface TemplateBlockNode extends TemplateBlock {
	children?: TemplateBlockNode[];
}
interface TemplateBlockRendererProps extends TemplatePreviewInteractions {
	block: TemplateBlockNode;
	databases: TemplateDatabaseSnapshot[];
}

export function TemplateBlockRenderer({
	block,
	databases,
	mode = "readonly",
	onDatabaseValueChange,
	onDatabaseViewChange,
	onTodoCheckedChange,
}: TemplateBlockRendererProps) {
	const type = block.type.toUpperCase();
	const content = block.content ?? {};
	const text =
		typeof content.text === "string" ? content.text : (block.title ?? "");
	// Legacy title-only snapshot blocks still use the same presentational leaves.
	const visualBlock = {
		content: { ...content, text },
		style_config: block.style_config,
	};
	switch (type) {
		case "HEADER":
		case "HEADING":
			return <ReadOnlyHeadingBlock block={visualBlock} />;
		case "TEXT":
		case "PARAGRAPH":
			return <ReadOnlyTextBlock block={visualBlock} />;
		case "TODO":
			return (
				<ReadOnlyTodoBlock
					block={visualBlock}
					mode={mode}
					onCheckedChange={
						onTodoCheckedChange
							? (checked) =>
									onTodoCheckedChange(block.id, checked)
							: undefined
					}
				/>
			);
		case "QUOTE":
			return <ReadOnlyQuoteBlock block={visualBlock} />;
		case "CODE":
			return <ReadOnlyCodeBlock block={visualBlock} />;
		case "TABLE_SIMPLE":
		case "TABLE":
			return <ReadOnlySimpleTableBlock block={visualBlock} />;
		case "IMAGE":
			return <ReadOnlyImageBlock block={visualBlock} />;
		case "FILE":
			return <ReadOnlyFileBlock block={visualBlock} />;
		case "VIDEO":
			return <ReadOnlyVideoBlock block={visualBlock} />;
		case "BOOKMARK":
			return <ReadOnlyBookmarkBlock block={visualBlock} />;
		case "DIVIDER":
			return <Separator className='w-full' />;
		case "DATABASE_VIEW":
			return (
				<TemplateDatabasePreview
					block={block}
					databases={databases}
					mode={mode}
					onDatabaseValueChange={onDatabaseValueChange}
					onDatabaseViewChange={onDatabaseViewChange}
				/>
			);
		case "TOGGLE": {
			const open = block.is_open ?? true;
			return (
				<div className='w-full'>
					<div
						className='flex min-h-7 w-full items-start rounded-sm text-left'
						aria-expanded={open}
					>
						<span className='flex size-7 shrink-0 items-center justify-center text-muted-foreground'>
							{open ? (
								<ChevronDown className='size-4' />
							) : (
								<ChevronRight className='size-4' />
							)}
						</span>
						<p className='min-h-7 whitespace-pre-wrap text-base leading-7'>
							{text}
						</p>
					</div>
					{open && (
						<div className='ml-7 pl-2 space-y-2'>
							{block.children?.map((child) => (
								<TemplateBlockRenderer
									key={child.id}
									block={child}
									databases={databases}
									mode={mode}
									onDatabaseValueChange={
										onDatabaseValueChange
									}
									onDatabaseViewChange={onDatabaseViewChange}
									onTodoCheckedChange={onTodoCheckedChange}
								/>
							))}
						</div>
					)}
				</div>
			);
		}
		case "LIST":
		case "BULLETED_LIST":
		case "NUMBERED_LIST":
			return (
				<div className='flex min-h-7 items-start gap-2'>
					<span className='text-base leading-7'>
						{type === "NUMBERED_LIST"
							? String(block.order_index + 1) + "."
							: "•"}
					</span>
					<p className='whitespace-pre-wrap text-base leading-7'>
						<ReadOnlyRichText text={text} />
					</p>
				</div>
			);
		case "CALLOUT":
			return (
				<div className='flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3'>
					<span>
						{typeof content.icon === "string" ? content.icon : "💡"}
					</span>
					<p className='whitespace-pre-wrap text-base leading-7'>
						<ReadOnlyRichText text={text} />
					</p>
				</div>
			);
		default:
			return (
				<div className='min-h-7 text-sm text-muted-foreground'>
					Unsupported block: {block.type}
				</div>
			);
	}
}

/**
 * Builds a hierarchical tree from flat template blocks based on parent_block_id and order_index.
 */
export function buildTemplateBlockTree(
	blocks: TemplateBlock[],
): TemplateBlockNode[] {
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
