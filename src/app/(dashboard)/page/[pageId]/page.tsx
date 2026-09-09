"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { useMyPageEditRequests } from "@/entities/page-edit-request/model/page-edit-request.queries";
import { usePage } from "@/entities/page/model/page.queries";

import { PageEditAccessBoundary } from "@/features/page-access/ui/page-edit-access-boundary";
import { RequestEditAccessDialog } from "@/features/page-edit-access/ui/request-edit-access-dialog";

import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";

export default function PageDetail() {
	const params = useParams<{
		pageId: string;
	}>();

	const [requestEditOpen, setRequestEditOpen] = useState(false);

	const { data: page, isLoading, isError } = usePage(params.pageId);

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

			<div className='flex items-center gap-1 px-12 pt-10 md:px-16 lg:px-24'>
				<div className='mb-3 text-5xl'>{page.icon || "📄"}</div>

				<h1 className='text-4xl font-bold'>
					{page.title || "Untitled"}
				</h1>
			</div>

			<PageEditAccessBoundary
				canEdit={page.canEdit}
				onRequestEdit={() => {
					setRequestEditOpen(true);
				}}
			>
				<div className='mt-14 w-full min-w-0 max-w-full px-12 md:px-16 lg:px-24'>
					<PageBlockList
						pageId={page.id}
						blocks={blockTree}
						canEdit={page.canEdit}
					/>
				</div>
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
