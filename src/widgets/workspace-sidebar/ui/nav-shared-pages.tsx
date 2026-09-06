"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useSharedWithMePages } from "@/entities/page-share/model/page-share.queries";
import { buildPageTree } from "@/entities/page/lib/build-page-tree";

import { PageTree } from "@/entities/page/ui/page-tree";

import { SidebarPageSection } from "@/widgets/workspace-sidebar/ui/sidebar-page-section";

interface NavSharedPagesProps {
	activePageId?: string;
}

export function NavSharedPages({ activePageId }: NavSharedPagesProps) {
	const router = useRouter();

	const { data: sharedPages = [], isLoading } = useSharedWithMePages();
	console.log("🚀 ~ sharedPages~", sharedPages);

	// Page shares can belong to workspaces the recipient is not a member of.
	const normalizedSharedPages = useMemo(() => {
		const sharedIds = new Set(sharedPages.map((page) => page.id));

		return sharedPages.map((page) => ({
			...page,

			parent_page_id:
				page.parent_page_id && sharedIds.has(page.parent_page_id)
					? page.parent_page_id
					: null,
		}));
	}, [sharedPages]);

	/**
	 * Flat list -> Page Tree.
	 */
	const sharedPageTree = useMemo(
		() => buildPageTree(normalizedSharedPages),
		[normalizedSharedPages],
	);

	if (isLoading || sharedPageTree.length === 0) {
		return null;
	}

	return (
		<SidebarPageSection
			title='Shared with me'
			className='group-data-[collapsible=icon]:hidden'
		>
			<PageTree
				pages={sharedPageTree}
				activePageId={activePageId}
				onOpenPage={(page) => {
					router.push(`/page/${page.id}`);
				}}
			/>
		</SidebarPageSection>
	);
}
