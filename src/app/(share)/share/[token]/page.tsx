"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

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
import { PageAccessGate } from "@/features/page-access/ui/page-access-gate";
import { Button } from "@/shared/ui/button";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";

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
	const requiresNormalAccess =
		resolveQuery.isSuccess && resolvedShare?.linkAccessLevel === null;

	// Invitation metadata is not an effective permission check.
	const accessQuery = usePageAccess(pageId ?? "", requiresNormalAccess);
	const hasNormalAccess =
		requiresNormalAccess &&
		accessQuery.isSuccess &&
		accessQuery.data.effectiveAccessLevel !== null;

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
		return <div className='p-6'>Loading...</div>;
	}

	if (resolveQuery.isError || !resolvedShare || !pageId) {
		return (
			<div role='alert' className='p-6'>
				Share link is invalid or unavailable.
			</div>
		);
	}

	if (requiresNormalAccess) {
		if (accessQuery.isPending) {
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
			return (
				<PageAccessGate
					key={`${pageId}:${token}`}
					pageId={pageId}
					token={token}
					isCheckingAccess={accessQuery.isFetching}
					onCheckAccess={() => void accessQuery.refetch()}
				/>
			);
		}
	}

	if (pageQuery.isLoading || blocksQuery.isLoading) {
		return <div className='p-6'>Loading page...</div>;
	}

	if (pageQuery.isError || blocksQuery.isError || !page) {
		return (
			<div role='alert' className='p-6'>Unable to load this page.</div>
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

			<div className='flex items-center gap-1 px-12 pt-10 md:px-16 lg:px-24'>
				<div className='mb-3 text-5xl'>{page.icon || "📄"}</div>
				<h1 className='text-4xl font-bold'>{page.title || "Untitled"}</h1>
			</div>

			<div className='mt-14 w-full min-w-0 max-w-full px-12 md:px-16 lg:px-24'>
				<PageBlockList
					pageId={page.id}
					blocks={blockTree}
					canEdit={false}
					shareToken={hasLinkAccess ? token : undefined}
				/>
			</div>
		</div>
	);
}
