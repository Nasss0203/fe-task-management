"use client";

import type { TemplatePreviewInteractions } from "../model/template-preview-interactions";

import type {
	PageTemplate,
	TemplateBlock,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import {
	PageContent,
	PageCover,
	PageHeader,
} from "@/entities/page/ui/page-surface";
import {
	buildTemplateBlockTree,
	TemplateBlockRenderer,
} from "./template-block-renderer";

export interface TemplateSnapshotRendererProps extends TemplatePreviewInteractions {
	template?: PageTemplate | null;
	blocks?: TemplateBlock[];
	databases?: TemplateDatabaseSnapshot[];
}

/** Pure serialized snapshot presentation, shared by public preview and thumbnail rendering. */
export function TemplateSnapshotRenderer({
	template,
	blocks = [],
	databases = [],
	mode = "readonly",
	onDatabaseValueChange,
	onDatabaseViewChange,
	onTodoCheckedChange,
}: TemplateSnapshotRendererProps) {
	const blockTree = buildTemplateBlockTree(blocks);

	return (
		<div className='w-full min-w-0 bg-background pb-16 text-foreground'>
			{template?.cover_url && (
				<PageCover url={template.cover_url} title={template.name} />
			)}

			<PageHeader icon={template?.icon} title={template?.name} />

			<PageContent>
				{blockTree.length ? (
					<div className='w-full min-w-0 max-w-full space-y-2'>
						{blockTree.map((block) => (
							<div key={block.id} className='min-w-0 py-0.5'>
								<TemplateBlockRenderer
									block={block}
									databases={databases}
									mode={mode}
									onDatabaseValueChange={
										onDatabaseValueChange
									}
									onDatabaseViewChange={
										onDatabaseViewChange
									}
									onTodoCheckedChange={
										onTodoCheckedChange
									}
								/>
							</div>
						))}
					</div>
				) : (
					<div className='min-h-32 py-10 text-sm text-muted-foreground'>
						This page is empty.
					</div>
				)}
			</PageContent>
		</div>
	);
}
