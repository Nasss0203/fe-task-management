"use client";

import { isAxiosError } from "axios";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { useMyPageEditRequests } from "@/entities/page-edit-request/model/page-edit-request.queries";
import { usePage } from "@/entities/page/model/page.queries";
import {
	PageContent,
	PageCover,
	PageHeader,
	PageSkeleton,
} from "@/entities/page/ui/page-surface";
import { PageUnavailable } from "@/entities/page/ui/page-unavailable";

import { EditablePageTitle } from "@/features/page/ui/editable-page-title";
import { PageEditAccessBoundary } from "@/features/page-access/ui/page-edit-access-boundary";
import { RequestEditAccessDialog } from "@/features/page-edit-access/ui/request-edit-access-dialog";

import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";
import { PageDiscussion } from "@/widgets/page-comments/ui/page-discussion";

export default function PageDetail() {
	const params = useParams<{
		pageId: string;
	}>();

	const [requestEditOpen, setRequestEditOpen] = useState(false);

	const { data: page, isLoading, isError, error } = usePage(params.pageId);

	const { data: blocks = [], isLoading: isBlocksLoading } = usePageBlocks(
		params.pageId,
	);

	const { data: myEditRequests = [], isLoading: isEditRequestsLoading } =
		useMyPageEditRequests(Boolean(page && !page.canEdit));

	const pendingEditRequest = myEditRequests.find(
		(request) =>
			request.pageId === params.pageId && request.status === "PENDING",
	);

	const hasPendingEditRequest = !!pendingEditRequest;

	const blockTree = useMemo(() => buildPageBlockTree(blocks), [blocks]);

	if (
		isLoading ||
		isBlocksLoading ||
		(Boolean(page && !page.canEdit) && isEditRequestsLoading)
	) {
		return <PageSkeleton />;
	}

	if (isError || !page) {
		const forbidden = isAxiosError(error) && error.response?.status === 403;

		return <PageUnavailable reason={forbidden ? "no-access" : "not-found"} />;
	}

	return (
		<div className='w-full min-w-0'>
			{page.cover_url && <PageCover url={page.cover_url} />}

			{/* Hover tiêu đề thì hiện "Add comment", giống Notion */}
			<div className='group/page-title'>
				<PageHeader
					icon={page.icon}
					title={page.title}
					titleEditor={
						page.canEdit ? (
							<EditablePageTitle
								key={page.title}
								pageId={page.id}
								workspaceId={page.workspace_id}
								title={page.title}
							/>
						) : undefined
					}
				/>

				<PageDiscussion pageId={page.id} />
			</div>

			<PageEditAccessBoundary
				canEdit={page.canEdit}
				onRequestEdit={() => {
					setRequestEditOpen(true);
				}}
			>
				<PageContent className='mt-8'>
					<PageBlockList
						pageId={page.id}
						blocks={blockTree}
						canEdit={page.canEdit}
					/>
				</PageContent>
			</PageEditAccessBoundary>

			<RequestEditAccessDialog
				pageId={page.id}
				open={requestEditOpen && !page.canEdit}
				hasPendingEditRequest={hasPendingEditRequest}
				onOpenChange={setRequestEditOpen}
			/>
		</div>
	);
}
