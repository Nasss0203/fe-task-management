import { FileText, LockKeyhole } from "lucide-react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";
import { EmptyPageBlockRow } from "./empty-page-block-row";
import { PageBlockEditorProvider } from "./page-block-editor-context";
import { PageBlockEditorRow } from "./page-block-editor-row";

interface PageBlockListProps {
	pageId: string;
	blocks: PageBlockNode[];
	canEdit: boolean;
}

function ReadOnlyBlockRow({ block }: { block: PageBlockNode }) {
	return (
		<div className='group -mx-2 grid min-h-8 w-[calc(100%+1rem)] grid-cols-[28px_28px_minmax(0,1fr)] items-center rounded-md px-2 transition-colors duration-150 hover:bg-muted/40'>
			<div className='size-7' aria-hidden='true' />
			<div
				className='flex size-7 items-center justify-center'
				aria-hidden='true'
			>
				<LockKeyhole className='size-3.5 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-70' />
			</div>
			<div className='min-w-0 py-0.5 pl-1'>
				<ReadOnlyPageBlockRenderer block={block} />
			</div>
		</div>
	);
}

export function PageBlockList({
	pageId,
	blocks,
	canEdit,
}: PageBlockListProps) {
	if (!canEdit) {
		return (
			<div className='w-full min-w-0 max-w-full space-y-1'>
				{blocks.map((block) => (
					<ReadOnlyBlockRow key={block.id} block={block} />
				))}

				{blocks.length === 0 && (
					<div className='flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 text-center'>
						<div className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
							<FileText className='size-5' />
						</div>
						<div className='space-y-1'>
							<p className='text-sm font-medium text-foreground/80'>
								Trang này chưa có nội dung
							</p>
							<p className='text-xs text-muted-foreground'>
								Bạn đang xem trang ở chế độ chỉ đọc.
							</p>
						</div>
					</div>
				)}
			</div>
		);
	}

	const orderedBlockIds = blocks.map((block) => block.id);

	return (
		<PageBlockEditorProvider orderedBlockIds={orderedBlockIds}>
			<div className='w-full min-w-0 max-w-full space-y-2'>
				{blocks.map((block) => (
					<PageBlockEditorRow key={block.id} block={block} />
				))}

				{blocks.length === 0 && <EmptyPageBlockRow pageId={pageId} />}
			</div>
		</PageBlockEditorProvider>
	);
}
