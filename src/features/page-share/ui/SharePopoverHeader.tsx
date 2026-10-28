import { CircleHelp } from "lucide-react";

import { TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function SharePopoverHeader({ showPublish }: { showPublish: boolean }) {
	return (
		<div className='flex h-11 items-stretch justify-between border-b border-border px-4'>
			<TabsList
				variant='line'
				className='h-11 gap-3 rounded-none p-0 text-[13px] font-semibold'
			>
				<TabsTrigger
					value='share'
					className='h-11 flex-none rounded-none px-2 text-[13px] text-muted-foreground after:bottom-0 data-[state=active]:text-foreground'
				>
					Share
				</TabsTrigger>

				{showPublish && (
					<TabsTrigger
						value='publish'
						className='h-11 flex-none rounded-none px-1 text-[13px] text-muted-foreground after:bottom-0 data-[state=active]:text-foreground'
					>
						Publish
					</TabsTrigger>
				)}
			</TabsList>

			<span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
				<CircleHelp className='size-3.5' />
				Learn about sharing
			</span>
		</div>
	);
}
