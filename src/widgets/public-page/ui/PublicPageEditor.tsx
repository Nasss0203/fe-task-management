"use client";

import { useMemo } from "react";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";

/**
 * The app's block editor on a published site, for signed-in members who may
 * edit the page. Edits go through the normal page APIs, so the site (which
 * reads live blocks) shows them on the next load.
 */
export function PublicPageEditor({ pageId }: { pageId: string }) {
	const { data: blocks = [], isLoading } = usePageBlocks(pageId);
	const blockTree = useMemo(() => buildPageBlockTree(blocks), [blocks]);

	if (isLoading) {
		return (
			<div className='space-y-3' role='status' aria-label='Loading editor'>
				<Skeleton className='h-5 w-full' />
				<Skeleton className='h-5 w-4/5' />
			</div>
		);
	}

	return <PageBlockList pageId={pageId} blocks={blockTree} canEdit />;
}
