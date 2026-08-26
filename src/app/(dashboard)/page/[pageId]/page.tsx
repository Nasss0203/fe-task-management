"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { usePage } from "@/entities/page/model/page.queries";

import { PageBlockRenderer } from "@/widgets/page-block/ui/page-block-renderer";

export default function PageDetail() {
	const params = useParams<{
		pageId: string;
	}>();

	const { data: page, isLoading, isError } = usePage(params.pageId);

	const { data: blocks = [], isLoading: isBlocksLoading } = usePageBlocks(
		params.pageId,
	);

	const blockTree = useMemo(() => buildPageBlockTree(blocks), [blocks]);

	if (isLoading || isBlocksLoading) {
		return <div className='p-6'>Loading...</div>;
	}

	if (isError || !page) {
		return <div className='p-6'>Page not found</div>;
	}

	return (
		<div className='w-full min-w-0'>
			{page.cover_url && (
				<div className='h-64 w-full overflow-hidden'>
					<img
						src={page.cover_url}
						alt=''
						className='h-full w-full object-cover'
					/>
				</div>
			)}

			<div className='px-12 pt-10 md:px-16 lg:px-24'>
				<div className='mb-3 text-5xl'>{page.icon || "📄"}</div>

				<h1 className='text-4xl font-bold'>
					{page.title || "Untitled"}
				</h1>
			</div>

			<div className='mt-14 w-full min-w-0 max-w-full px-12 md:px-16 lg:px-24'>
				<div className='w-full min-w-0 max-w-full space-y-4'>
					{blockTree.map((block) => (
						<PageBlockRenderer key={block.id} block={block} />
					))}
				</div>
			</div>
		</div>
	);
}
