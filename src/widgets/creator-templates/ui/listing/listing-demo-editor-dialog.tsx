"use client";

import { Eye, PencilRuler, RotateCw } from "lucide-react";

import {
	useTemplatePreview,
	type PageTemplate,
	type TemplateBlock,
} from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

import { summarizeDemo } from "../../model/demo-visibility";
import { demoBlockAnchorId, ListingDemoCanvas } from "./listing-demo-canvas";
import { ListingDemoLivePreview } from "./listing-demo-live-preview";
import { ListingDemoVisibility } from "./listing-demo-visibility";
import { useDemoSelection } from "./use-demo-selection";

export type DemoEditorTab = "edit" | "visitor";

interface ListingDemoEditorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tab: DemoEditorTab;
	onTabChange: (tab: DemoEditorTab) => void;
	template: PageTemplate;
	versionId: string;
	versionLabel: string;
	disabled?: boolean;
}

/**
 * Full-screen workspace for a LIMITED demo: outline on the left, the whole
 * template on the right (click blocks to show/hide), and the exact visitor
 * view from the backend one tab away. Edits go straight into the listing form.
 */
export function ListingDemoEditorDialog({
	open,
	onOpenChange,
	tab,
	onTabChange,
	template,
	versionId,
	versionLabel,
	disabled,
}: ListingDemoEditorDialogProps) {
	// Owner preview: the full snapshot is the creator's own content.
	const snapshot = useTemplatePreview(template.id, versionId, { enabled: open });
	const blocks = snapshot.data?.blocks ?? [];
	const api = useDemoSelection(blocks);
	const summary = snapshot.data ? summarizeDemo(snapshot.data, api.selection) : null;

	const locate = (blockId: string) => {
		const rootId = topLevelAncestor(blocks, blockId);
		onTabChange("edit");
		requestAnimationFrame(() =>
			document
				.getElementById(demoBlockAnchorId(rootId))
				?.scrollIntoView({ behavior: "smooth", block: "center" }),
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className='flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none'
			>
				<DialogHeader className='flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b px-5 py-3 text-left'>
					<div className='min-w-0'>
						<DialogTitle className='text-base'>Demo content · {versionLabel}</DialogTitle>
						<DialogDescription className='text-xs'>
							Click blocks to show or hide them. Anything hidden never leaves
							the server.
						</DialogDescription>
					</div>

					<div className='flex flex-wrap items-center gap-3'>
						{summary && (
							<span className='text-xs text-muted-foreground'>
								<b className='font-medium text-foreground'>{summary.shownBlocks}</b>/
								{summary.totalBlocks} blocks ·{" "}
								<b className='font-medium text-foreground'>{summary.shownRows}</b>/
								{summary.totalRows} rows shown
							</span>
						)}
						<div
							role='tablist'
							aria-label='Demo editor view'
							className='inline-flex rounded-lg bg-muted p-0.5'
							onKeyDown={(event) => {
								if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
								const next = tab === "edit" ? "visitor" : "edit";
								onTabChange(next);
								document.getElementById(`demo-editor-tab-${next}`)?.focus();
							}}
						>
							<TabButton id='edit' active={tab === "edit"} onClick={() => onTabChange("edit")}>
								<PencilRuler className='size-3.5' />
								Edit
							</TabButton>
							<TabButton
								id='visitor'
								active={tab === "visitor"}
								onClick={() => onTabChange("visitor")}
							>
								<Eye className='size-3.5' />
								Visitor view
							</TabButton>
						</div>
						<Button type='button' size='sm' onClick={() => onOpenChange(false)}>
							Done
						</Button>
					</div>
				</DialogHeader>

				<div
					role='tabpanel'
					id='demo-editor-panel'
					aria-labelledby={`demo-editor-tab-${tab}`}
					className='min-h-0 flex-1'
				>
					{snapshot.isPending ? (
						<div className='flex flex-col gap-3 p-6'>
							<Skeleton className='h-8 w-1/3' />
							<Skeleton className='h-4 w-2/3' />
							<Skeleton className='h-40 w-full' />
						</div>
					) : snapshot.isError ? (
						<div className='flex h-full items-center justify-center'>
							<Button type='button' variant='outline' onClick={() => snapshot.refetch()}>
								<RotateCw className='size-3.5' />
								Reload content
							</Button>
						</div>
					) : tab === "visitor" ? (
						<ListingDemoLivePreview template={template} fill />
					) : (
						<div className='grid h-full min-h-0 grid-rows-[minmax(0,40%)_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)] lg:grid-rows-1'>
							<aside className='min-h-0 overflow-y-auto border-b p-4 lg:border-b-0 lg:border-r'>
								<ListingDemoVisibility
									blocks={blocks}
									databases={snapshot.data.databases}
									api={api}
									disabled={disabled}
									onLocate={locate}
								/>
							</aside>
							<div className='min-h-0 overflow-y-auto bg-muted/20'>
								<div className='mx-auto my-4 w-[calc(100%-2rem)] max-w-7xl rounded-xl border bg-background shadow-xs lg:my-6'>
									<ListingDemoCanvas
										template={template}
										snapshot={snapshot.data}
										api={api}
										disabled={disabled}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function TabButton({
	id,
	active,
	onClick,
	children,
}: {
	id: DemoEditorTab;
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type='button'
			role='tab'
			id={`demo-editor-tab-${id}`}
			aria-selected={active}
			aria-controls='demo-editor-panel'
			tabIndex={active ? 0 : -1}
			onClick={onClick}
			className={cn(
				"inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
				active
					? "bg-background text-foreground shadow-xs"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			{children}
		</button>
	);
}

function topLevelAncestor(blocks: TemplateBlock[], blockId: string): string {
	const byId = new Map(blocks.map((block) => [block.id, block]));
	let current = byId.get(blockId);
	const seen = new Set<string>();
	while (current?.parent_block_id && byId.has(current.parent_block_id)) {
		if (seen.has(current.id)) break;
		seen.add(current.id);
		current = byId.get(current.parent_block_id);
	}
	return current?.id ?? blockId;
}
