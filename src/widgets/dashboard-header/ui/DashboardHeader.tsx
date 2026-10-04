import { MoreHorizontal, Star } from "lucide-react";

import { usePage } from "@/entities/page/model/page.queries";
import { PageActionsMenu } from "@/features/page/page-actions/ui/page-actions-menu";
import ShareButton from "@/features/page-share/ui/ShareButton";
import { Button } from "@/shared/ui/button";

interface DashboardHeaderProps {
	pageId?: string;
}

function DashboardHeader({ pageId }: DashboardHeaderProps) {
	const { data: page } = usePage(pageId);

	return (
		<header className='flex items-center gap-2 text-sm'>
			<div className='hidden text-xs text-muted-foreground md:inline-block'>
				Edit Oct 08
			</div>

			{pageId && <ShareButton pageId={pageId} />}

			<Button variant='ghost' size='icon' className='h-7 w-7'>
				<Star />
			</Button>

			{page && (
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
			)}
		</header>
	);
}

export default DashboardHeader;
