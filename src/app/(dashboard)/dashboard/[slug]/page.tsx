"use client";

import { BlockList } from "@/components/block";
import { TabsListCustom, TabsTriggerCustom } from "@/components/tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { WorkspaceTopHeader } from "@/components/workspaces/WorkspaceHeader";
import WorkspaceOverview from "@/components/workspaces/WorkspaceOverview";
import { usePage } from "@/hooks/use-page";
import { usePageBlock } from "@/hooks/use-pageBlock";
import { PageBlockItem } from "@/services/page_block/type";
import { BarChart3, List } from "lucide-react";
import { useEffect, useRef } from "react";

const SlugPage = () => {
	const {
		pages: { data, isLoading },
	} = usePage();

	const {
		updatePageBlock: { mutate },
	} = usePageBlock();

	const page = data?.data;
	const blocks: PageBlockItem[] = page?.blocks ?? [];

	const initializedRef = useRef(false);

	useEffect(() => {
		if (!blocks.length || initializedRef.current) return;
		initializedRef.current = true;
	}, [blocks]);

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
			className='flex min-h-screen flex-col pb-10'
		>
			<WorkspaceTopHeader workspaceName={page?.title} />

			<div className='border-b border-border'>
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

			<div className='flex-1 px-10 py-3'>
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
