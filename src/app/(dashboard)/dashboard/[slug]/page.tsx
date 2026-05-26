"use client";

import { BlockList } from "@/components/block";
import { TabsListCustom, TabsTriggerCustom } from "@/components/tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { WorkspaceTopHeader } from "@/components/workspaces/WorkspaceHeader";
import WorkspaceOverview from "@/components/workspaces/WorkspaceOverview";
import { usePage } from "@/hooks/use-page";
import { PageBlockItem } from "@/services/page_block/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { BarChart3, List } from "lucide-react";

const SlugPage = () => {
	const { currentWorkspaceId } = useProjectSelectionStore();
	const workspaceId = currentWorkspaceId as string;
	const {
		pages: { data, isLoading },
	} = usePage();

	const page = data?.data;
	const blocks: PageBlockItem[] = page?.blocks ?? [];

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
				Loading...
			</div>
		);
	}

	return (
		<Tabs
			defaultValue='summary'
			className='flex min-h-0 flex-1 flex-col overflow-hidden'
		>
			<WorkspaceTopHeader
				workspaceName={page?.title}
				workspaceId={workspaceId}
			/>

			<div className='shrink-0 border-b border-border'>
				<TabsListCustom
					variant='line'
					className='h-10 bg-transparent p-0'
				>
					<TabsTriggerCustom value='summary'>
						<BarChart3 size={15} />
						Summary
					</TabsTriggerCustom>

					<TabsTriggerCustom value='pages'>
						<List size={15} />
						Pages
					</TabsTriggerCustom>
				</TabsListCustom>
			</div>

			<div className='min-h-0 flex-1 overflow-y-auto px-10 py-3 pb-10'>
				<TabsContent value='summary' className='mt-0'>
					<WorkspaceOverview workspaceSlug={page?.slug as string} />
				</TabsContent>

				<TabsContent value='pages' className='mt-0'>
					<BlockList blocks={blocks} page={page} />
				</TabsContent>
			</div>
		</Tabs>
	);
};

export default SlugPage;
