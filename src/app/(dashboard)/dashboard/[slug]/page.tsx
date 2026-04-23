"use client";

import { BlockList } from "@/components/block";
import DashboarWorkspace from "@/components/dashboard/DashboardWorkspace";
import { TabsListCustom, TabsTriggerCustom } from "@/components/tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { usePage } from "@/hooks/use-page";
import { usePageBlock } from "@/hooks/use-pageBlock";
import { PageBlockItem } from "@/services/page_block/type";

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
		return <div>Loading...</div>;
	}

	const handleUpdateDataConfigPageblock = (block: PageBlockItem) => {
		if (!block.id) return;

		mutate({
			...block,
			id: block.id,
			is_open: !block.is_open,
		});
	};

	return (
		<Tabs defaultValue='dashboard'>
			<TabsListCustom variant='default'>
				<TabsTriggerCustom value='dashboard'>
					Dashboard
				</TabsTriggerCustom>
				<TabsTriggerCustom value='overview'>Overview</TabsTriggerCustom>
			</TabsListCustom>
			<TabsContent value='dashboard'>
				<DashboarWorkspace
					workspaceName={page?.title}
					workspaceSlug={page?.slug as string}
				></DashboarWorkspace>
			</TabsContent>
			<TabsContent value='overview'>
				<div className='flex h-screen flex-col gap-5'>
					<div className='flex flex-col gap-3 px-20'>
						<div className='w-full'>
							<textarea
								defaultValue={page?.title}
								placeholder='New page'
								rows={1}
								onInput={(e) => {
									const target = e.currentTarget;
									target.style.height = "auto";
									target.style.height = `${target.scrollHeight}px`;
								}}
								className='w-full resize-none overflow-hidden border-none bg-transparent text-3xl font-extrabold outline-none ring-0 placeholder:text-2xl placeholder:font-bold focus:outline-none focus:ring-0'
							/>
						</div>
						<BlockList blocks={blocks} page={page}></BlockList>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
};

export default SlugPage;
