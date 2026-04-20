import { Activity, BadgeCheck } from "lucide-react";
import { ActivityItem } from "../shared/types";


type Props = {
	items: ActivityItem[];
};

export function RecentActivity({ items }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4 flex items-center gap-2'>
				<Activity className='h-5 w-5 text-neutral-300' />
				<h2 className='text-lg font-semibold text-white'>Recent Activity</h2>
			</div>

			<div className='space-y-4'>
				{items.map((item, index) => (
					<div key={item.title} className='flex gap-3'>
						<div className='flex flex-col items-center'>
							<div className='mt-1 rounded-full border border-neutral-700 bg-neutral-900 p-1.5'>
								<BadgeCheck className='h-3.5 w-3.5 text-neutral-300' />
							</div>
							{index !== items.length - 1 && (
								<div className='mt-2 h-full w-px bg-neutral-800' />
							)}
						</div>

						<div className='pb-2'>
							<div className='flex items-center gap-2'>
								<p className='text-sm font-medium text-white'>{item.title}</p>
								<span className='text-xs text-neutral-500'>{item.time}</span>
							</div>
							<p className='mt-1 text-sm leading-6 text-neutral-400'>
								{item.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}