"use client";

import { BlockList } from "@/components/block";
import { TabsContent } from "@/components/ui/tabs";
import WorkspaceOverview from "@/features/workspace/components/workspaces/WorkspaceOverview";
import { PageItem } from "@/services/page/type";
import { PageBlockItem } from "@/services/page_block/type";

type WorkspacePageContentProps = {
	page?: PageItem;
	blocks: PageBlockItem[];
};

const WorkspacePageContent = ({ page, blocks }: WorkspacePageContentProps) => {
	return (
		<div className='min-h-0 flex-1 overflow-y-auto px-10 py-3 pb-10'>
			<TabsContent value='summary' className='mt-0'>
				<WorkspaceOverview workspaceSlug={page?.slug as string} />
			</TabsContent>

			<TabsContent value='pages' className='mt-0'>
				<BlockList blocks={blocks} page={page} />
			</TabsContent>
		</div>
	);
};

export default WorkspacePageContent;
