"use client";

import { BlockList } from "@/components/block";
import { PageItem } from "@/services/page/type";
import { PageBlockItem } from "@/services/page_block/type";

type WorkspacePageBlocksContentProps = {
	page?: PageItem;
	blocks: PageBlockItem[];
};

const WorkspacePageBlocksContent = ({
	page,
	blocks,
}: WorkspacePageBlocksContentProps) => {
	return (
		<div className='min-h-0 flex-1 overflow-y-auto px-10 py-3 pb-10'>
			<BlockList blocks={blocks} page={page} />
		</div>
	);
};

export default WorkspacePageBlocksContent;
