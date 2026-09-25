import { CircleHelp } from "lucide-react";

export function SharePopoverHeader() {
	return (
		<div className='flex h-11 items-stretch justify-between border-b border-[#3a3a3a] px-4'>
			<div className='flex items-stretch gap-3 text-[13px] font-semibold'>
				<span className='flex items-center border-b-2 border-white px-2 text-white'>
					Share
				</span>

				<span className='flex items-center px-1 text-[#777]'>
					Publish
				</span>
			</div>

			<span className='flex items-center gap-1.5 text-xs text-[#888]'>
				<CircleHelp className='size-3.5' />
				Learn about sharing
			</span>
		</div>
	);
}
