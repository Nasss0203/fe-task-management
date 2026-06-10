"use client";

import { TabsListCustom, TabsTriggerCustom } from "@/components/tabs";
import { BarChart3, List } from "lucide-react";

const WorkspacePageTabs = () => {
	return (
		<div className='shrink-0 border-b border-border'>
			<TabsListCustom variant='line' className='h-10 bg-transparent p-0'>
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
	);
};

export default WorkspacePageTabs;
