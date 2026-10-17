"use client";

import { Eye, EyeOff, Lock } from "lucide-react";

import { PageContent, PageCover, PageHeader } from "@/entities/page/ui/page-surface";
import type { PageTemplate, TemplatePreview } from "@/entities/template";
import {
	buildTemplateBlockTree,
	TemplateBlockRenderer,
} from "@/features/template-preview";
import { cn } from "@/shared/lib/utils";

import {
	describeBlock,
	PRIVATE_DEMO_BLOCK_TYPES,
} from "../../model/demo-visibility";
import type { DemoSelectionApi } from "./use-demo-selection";

export const demoBlockAnchorId = (blockId: string) => `demo-block-${blockId}`;

/**
 * The whole template as the creator sees it. Each top-level block is a toggle:
 * click to show or hide it; hidden blocks stay visible here, dimmed.
 */
export function ListingDemoCanvas({
	template,
	snapshot,
	api,
	disabled,
}: {
	template: PageTemplate;
	snapshot: TemplatePreview;
	api: DemoSelectionApi;
	disabled?: boolean;
}) {
	const tree = buildTemplateBlockTree(snapshot.blocks);

	return (
		<div className='w-full min-w-0 pb-16'>
			{template.cover_url && (
				<PageCover url={template.cover_url} title={template.name} />
			)}
			{/* Tighter gutters than the real page: the editor needs room for wide tables. */}
			<PageHeader
				icon={template.icon}
				title={template.name}
				className='px-6 pt-8 md:px-10 lg:px-12'
			/>
			<PageContent className='mt-8 px-6 md:px-10 lg:px-12'>
				{tree.length === 0 ? (
					<p className='py-10 text-sm text-muted-foreground'>This version is empty.</p>
				) : (
					<div className='flex flex-col gap-2'>
						{tree.map((block) => {
							const isPrivate = PRIVATE_DEMO_BLOCK_TYPES.has(block.type);
							const shown = api.selected.has(block.id);
							const toggle = () => {
								if (!isPrivate && !disabled) api.toggle(block.id, !shown);
							};

							return (
								<div
									key={block.id}
									id={demoBlockAnchorId(block.id)}
									role='button'
									tabIndex={isPrivate || disabled ? -1 : 0}
									aria-pressed={shown}
									aria-label={`${shown ? "Hide" : "Show"} ${describeBlock(block)}`}
									onClick={toggle}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											toggle();
										}
									}}
									className={cn(
										"group relative -mx-3 scroll-mt-24 rounded-lg border px-3 py-1 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
										isPrivate || disabled ? "cursor-not-allowed" : "cursor-pointer",
										shown
											? "border-transparent hover:border-primary/40"
											: "border-dashed border-border bg-muted/30 hover:border-foreground/30",
									)}
								>
									<span
										className={cn(
											"absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium shadow-xs transition-opacity",
											shown
												? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
												: "opacity-100",
										)}
									>
										{isPrivate ? (
											<>
												<Lock className='size-3' /> Never public
											</>
										) : shown ? (
											<>
												<Eye className='size-3 text-primary' /> Shown
											</>
										) : (
											<>
												<EyeOff className='size-3' /> Hidden
											</>
										)}
									</span>
									{/* The block is a toggle surface, not interactive content. */}
									<div
										className={cn(
											"pointer-events-none transition-opacity",
											!shown && "opacity-35 grayscale",
										)}
									>
										<TemplateBlockRenderer
											block={block}
											databases={snapshot.databases}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</PageContent>
		</div>
	);
}
