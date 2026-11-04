"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useMyPageAccessRequest } from "@/entities/page-access-request/model/page-access-request.queries";
import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import {
	usePageBlocks,
	useSharedPageBlocks,
} from "@/entities/page-block/model/page-block.queries";
import {
	usePageAccess,
	useResolvePageShareLink,
} from "@/entities/page-share/model/page-share.queries";
import { usePage, useSharedPage } from "@/entities/page/model/page.queries";
import { PageSkeleton } from "@/entities/page/ui/page-surface";
import { PageAccessGate } from "@/features/page-access/ui/page-access-gate";
import { PageEditAccessBoundary } from "@/features/page-access/ui/page-edit-access-boundary";
import { PageShareInvitationGate } from "@/features/page-share/ui/page-share-invitation-gate";
import { Button } from "@/shared/ui/button";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";
import { PageDiscussion } from "@/widgets/page-comments/ui/page-discussion";
import { PublicEditAccessDialog } from "@/widgets/public-page/ui/PublicEditAccessDialog";

export default function SharedPageDetail() {
	const params = useParams<{ token: string }>();
	const token = params.token;
	const resolveQuery = useResolvePageShareLink(token);
	const resolvedShare = resolveQuery.data;
	const pageId = resolvedShare?.pageId;

	const hasLinkAccess =
		resolveQuery.isSuccess &&
		(resolvedShare?.linkAccessLevel === "VIEWER" ||
			resolvedShare?.linkAccessLevel === "EDITOR");
	const canEditWithLink =
		hasLinkAccess && resolvedShare?.linkAccessLevel === "EDITOR";
	const requiresNormalAccess =
		resolveQuery.isSuccess && resolvedShare?.linkAccessLevel === null;

	const [editAccessOpen, setEditAccessOpen] = useState(false);

	// Invitation metadata is not an effective permission check.
	// Link access cũng cần: người có quyền sửa thật thì sửa được, người chỉ xem thì xin quyền sửa
	const accessQuery = usePageAccess(pageId ?? "", resolveQuery.isSuccess);
	const hasNormalAccess =
		requiresNormalAccess &&
		accessQuery.isSuccess &&
		accessQuery.data.effectiveAccessLevel !== null;
	const normalLevel = accessQuery.data?.effectiveAccessLevel ?? null;
	const canEditPage =
		canEditWithLink || normalLevel === "EDITOR" || normalLevel === "FULL_ACCESS";

	const myAccessRequestQuery = useMyPageAccessRequest(
		pageId,
		requiresNormalAccess &&
			resolvedShare?.invitation === null &&
			accessQuery.isSuccess &&
			accessQuery.data.effectiveAccessLevel === null,
	);

	const sharedPageQuery = useSharedPage(pageId, token, hasLinkAccess);
	const sharedBlocksQuery = useSharedPageBlocks(pageId, token, hasLinkAccess);
	const normalPageQuery = usePage(pageId, hasNormalAccess);
	const normalBlocksQuery = usePageBlocks(pageId, hasNormalAccess);

	const pageQuery = hasLinkAccess ? sharedPageQuery : normalPageQuery;
	const blocksQuery = hasLinkAccess ? sharedBlocksQuery : normalBlocksQuery;
	const page = pageQuery.data;
	const blockTree = useMemo(
		() => buildPageBlockTree(blocksQuery.data ?? []),
		[blocksQuery.data],
	);

	if (resolveQuery.isLoading) {
		return <PageSkeleton />;
	}

	if (resolveQuery.isError || !resolvedShare || !pageId) {
		return (
			<div role='alert' className='p-6'>
				Share link is invalid or unavailable.
			</div>
		);
	}

	if (requiresNormalAccess) {
		if (accessQuery.isLoading) {
			return <div className='p-6'>Checking access...</div>;
		}

		if (accessQuery.isError) {
			return (
				<div className='space-y-3 p-6'>
					<p role='alert'>
						Unable to check page access. Please try again.
					</p>
					<Button
						type='button'
						disabled={accessQuery.isFetching}
						onClick={() => void accessQuery.refetch()}
					>
						Try again
					</Button>
				</div>
			);
		}

		if (
			accessQuery.isSuccess &&
			accessQuery.data.effectiveAccessLevel === null
		) {
			// Direct invitation được ưu tiên trước Request Access.
			if (resolvedShare.invitation) {
				return (
					<PageShareInvitationGate
						key={`${pageId}:${token}:${resolvedShare.invitation.shareId}`}
						token={token}
						invitation={resolvedShare.invitation}
						isCheckingAccess={accessQuery.isFetching}
						onCheckAccess={() => void accessQuery.refetch()}
					/>
				);
			}

			return (
				<PageAccessGate
					key={`${pageId}:${token}`}
					pageId={pageId}
					token={token}
					hasPendingRequest={
						myAccessRequestQuery.data?.status === "PENDING"
					}
					isCheckingAccess={accessQuery.isFetching}
					onCheckAccess={() => void accessQuery.refetch()}
				/>
			);
		}
	}

	if (pageQuery.isLoading || blocksQuery.isLoading) {
		return <PageSkeleton />;
	}

	if (pageQuery.isError || blocksQuery.isError || !page) {
		return (
			<div role='alert' className='p-6'>
				Unable to load this page.
			</div>
		);
	}

	return (
		<div className='w-full min-w-0 py-10'>
			{page.cover_url && (
				<div className='h-64 w-full overflow-hidden'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={page.cover_url}
						alt=''
						className='h-full w-full object-cover'
					/>
				</div>
			)}

			<div className='mx-auto flex max-w-[1440px] items-center gap-1 px-12 pt-10 md:px-16 lg:px-24'>
				<div className='mb-3 text-5xl'>{page.icon || "📄"}</div>
				<h1 className='text-4xl font-bold'>
					{page.title || "Untitled"}
				</h1>
			</div>

			{/* Link share: chỉ đọc comment; có quyền thật trên page thì comment như bình thường */}
			<div className='mt-4'>
				<PageDiscussion
					pageId={page.id}
					shareToken={hasLinkAccess ? token : undefined}
				/>
			</div>

			<div className='mx-auto mt-14 w-full min-w-0 max-w-[1440px] px-12 md:px-16 lg:px-24'>
				{/* Link chỉ cho xem: bấm vào nội dung thì hỏi xin quyền sửa */}
				<PageEditAccessBoundary
					canEdit={canEditPage || !hasLinkAccess}
					onRequestEdit={() => setEditAccessOpen(true)}
				>
					<PageBlockList
						pageId={page.id}
						blocks={blockTree}
						canEdit={canEditPage}
						shareToken={hasLinkAccess ? token : undefined}
					/>
				</PageEditAccessBoundary>
			</div>

			{hasLinkAccess && !canEditPage && accessQuery.isSuccess && (
				<PublicEditAccessDialog
					pageId={page.id}
					source={{ token }}
					authenticated
					open={editAccessOpen}
					onOpenChange={setEditAccessOpen}
				/>
			)}
		</div>
	);
}
