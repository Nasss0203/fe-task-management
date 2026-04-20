import { SystemHealthItem } from "../shared/types";
import { getHealthClass } from "../shared/utils";

type Props = {
	items: SystemHealthItem[];
};

export function SystemHealth({ items }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold text-white'>
					System Health
				</h2>
				<p className='text-sm text-neutral-400'>
					Quick health indicators across services.
				</p>
			</div>

			<div className='space-y-3'>
				{items.map((item) => (
					<div
						key={item.label}
						className='flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3'
					>
						<span className='text-sm text-neutral-300'>
							{item.label}
						</span>
						<span
							className={`text-sm font-semibold ${getHealthClass(item.level)}`}
						>
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
