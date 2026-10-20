import { MoreHorizontal } from "lucide-react";

import { usePage } from "@/entities/page/model/page.queries";
import { FavoritePageButton } from "@/features/page/favorite-page/ui/favorite-page-button";
import { PageActionsMenu } from "@/features/page/page-actions/ui/page-actions-menu";
import ShareButton from "@/features/page-share/ui/ShareButton";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Button } from "@/shared/ui/button";

interface DashboardHeaderProps {
	pageId?: string;
}

function DashboardHeader({ pageId }: DashboardHeaderProps) {
	const { data: page } = usePage(pageId);

	if (!pageId) return null;

	const editedAt = formatRelativeTime(page?.updatedAt);

	return (
		<header className='flex items-center gap-2 text-sm'>
			{editedAt && (
				<div className='hidden text-xs text-muted-foreground md:inline-block'>
					Edited {editedAt}
				</div>
			)}

			<ShareButton pageId={pageId} />

			{page && (
				<>
					<FavoritePageButton page={page} />

					<PageActionsMenu page={page}>
						<Button
							variant='ghost'
							size='icon'
							className='h-7 w-7'
							aria-label='More page actions'
						>
							<MoreHorizontal className='size-4' />
						</Button>
					</PageActionsMenu>
				</>
			)}
		</header>
	);
}

export default DashboardHeader;
