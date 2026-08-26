// widgets/dashboard-header/ui/DashboardHeader.tsx

import ShareButton from "@/features/workspaces/ui/ShareButton";
import { Button } from "@/shared/ui/button";
import { Star } from "lucide-react";

function DashboardHeader() {
	return (
		<header className='flex items-center gap-2 text-sm'>
			<div className='hidden text-xs text-muted-foreground md:inline-block'>
				Edit Oct 08
			</div>
			<ShareButton />
			<Button variant='ghost' size='icon' className='h-7 w-7'>
				<Star />
			</Button>
		</header>
	);
}

export default DashboardHeader;
