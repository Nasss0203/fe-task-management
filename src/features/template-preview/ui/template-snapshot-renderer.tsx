"use client";

import type {
	PageTemplate,
	TemplateBlock,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import { Eye } from "lucide-react";
import React from "react";
import {
	buildTemplateBlockTree,
	TemplateBlockRenderer,
} from "./template-block-renderer";

export interface TemplateSnapshotRendererProps {
	template?: PageTemplate | null;
	blocks?: TemplateBlock[];
	databases?: TemplateDatabaseSnapshot[];
}

export function TemplateSnapshotRenderer({
	template,
	blocks = [],
	databases = [],
}: TemplateSnapshotRendererProps) {
	const blockTree = React.useMemo(() => {
		return buildTemplateBlockTree(blocks);
	}, [blocks]);

	return (
		<div className='flex-1 flex flex-col'>
			{/* Cover Image if present */}
			{template?.cover_url && (
				<div className='h-48 md:h-64 w-full overflow-hidden border-b border-border/50 relative bg-muted/20'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={template.cover_url}
						alt={template.name}
						className='h-full w-full object-cover'
					/>
				</div>
			)}

			<div className='w-full px-6 md:px-8 xl:px-10 py-8 md:py-10 flex-1 flex flex-col'>
				{/* Page Icon if present */}
				{template?.icon && (
					<div className='text-3xl mb-4 select-none' aria-hidden='true'>
						{template.icon}
					</div>
				)}

				{/* Render Page Snapshot Blocks */}
				{blockTree.length > 0 ? (
					<div className='space-y-2 flex-1 w-full'>
						{blockTree.map((block) => (
							<TemplateBlockRenderer
								key={block.id}
								block={block}
								databases={databases}
							/>
						))}
					</div>
				) : (
					<div className='flex-1 flex flex-col items-center justify-center py-20 text-center text-muted-foreground'>
						<div className='flex size-12 items-center justify-center rounded-full bg-muted/30 mb-3'>
							<Eye className='size-5 text-muted-foreground/60' />
						</div>
						<p className='text-sm font-medium text-foreground/80'>
							No blocks in this version
						</p>
						<p className='text-xs text-muted-foreground mt-1 max-w-sm'>
							This template version snapshot does not contain any content blocks yet.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
