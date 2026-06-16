"use client";

import { WorkspacePageShell } from "@/features/workspace/components/workspaces/workspace-page";
import { usePageBlock } from "@/features/page-block/hooks/usePageBlock";
import { usePage } from "@/features/page/hooks/usePage";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { PageBlockItem } from "@/services/page_block/type";
import { WorkspaceItem } from "@/services/workspace/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useParams } from "next/navigation";

const SlugPage = () => {
	const params = useParams<{ slug: string }>();
	const { currentWorkspaceId } = useProjectSelectionStore();
	const workspaceId = currentWorkspaceId as string;
	const {
		pages: { data, isLoading },
	} = usePage();
	const {
		workspaceFindAll: { data: workspaceQuery, isLoading: isWorkspaceLoading },
	} = useWorkspace();

	const page = data?.data;
	const workspaces: WorkspaceItem[] = workspaceQuery?.data ?? [];
	const workspace = workspaces.find((item) => item.slug === params.slug);
	const resolvedWorkspaceId = workspace?.id ?? workspaceId;
	const {
		pageBlocks: { data: pageBlocksData, isPending: isPageBlocksPending },
	} = usePageBlock({ pageId: page?.id });
	const blocks: PageBlockItem[] =
		pageBlocksData?.data ?? page?.blocks ?? [];

	if (isLoading || isPageBlocksPending || isWorkspaceLoading) {
		return (
			<div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
				Đang tải...
			</div>
		);
	}

	return (
		<WorkspacePageShell
			workspaceId={resolvedWorkspaceId}
			workspaceName={workspace?.name}
			page={page}
			blocks={blocks}
			layoutMode={workspace?.layoutMode}
		/>
	);
};

export default SlugPage;
