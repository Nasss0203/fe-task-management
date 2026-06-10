"use client";

import { Tabs } from "@/components/ui/tabs";
import { WorkspaceTopHeader } from "@/features/workspace/components/workspaces/WorkspaceHeader";
import { PageItem } from "@/services/page/type";
import { PageBlockItem } from "@/services/page_block/type";
import { WorkspaceLayoutMode } from "@/services/workspace/type";
import WorkspacePageBlocksContent from "./WorkspacePageBlocksContent";
import WorkspacePageContent from "./WorkspacePageContent";
import WorkspacePageTabs from "./WorkspacePageTabs";

type WorkspacePageShellProps = {
	workspaceId: string;
	workspaceName?: string;
	page?: PageItem;
	blocks: PageBlockItem[];
	layoutMode?: WorkspaceLayoutMode;
};

const WorkspacePageShell = ({
	workspaceId,
	workspaceName,
	page,
	blocks,
	layoutMode,
}: WorkspacePageShellProps) => {
	const useTabs = (layoutMode ?? WorkspaceLayoutMode.TABS) ===
		WorkspaceLayoutMode.TABS;

	if (!useTabs) {
		return (
			<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
				<WorkspaceTopHeader
					workspaceName={workspaceName}
					workspaceId={workspaceId}
				/>

				<WorkspacePageBlocksContent page={page} blocks={blocks} />
			</div>
		);
	}

	return (
		<Tabs
			defaultValue='summary'
			className='flex min-h-0 flex-1 flex-col overflow-hidden'
		>
			<WorkspaceTopHeader
				workspaceName={workspaceName}
				workspaceId={workspaceId}
			/>

			<WorkspacePageTabs />

			<WorkspacePageContent page={page} blocks={blocks} />
		</Tabs>
	);
};

export default WorkspacePageShell;
