import { RetentionMetric } from "../shared/types";

type Props = {
	items: RetentionMetric[];
};

export function RetentionCard({ items }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold text-white'>
					Retention & Churn
				</h2>
				<p className='text-sm text-neutral-400'>
					Key business health metrics for billing and usage.
				</p>
			</div>

			<div className='space-y-3'>
				{items.map((item) => (
					<div
						key={item.label}
						className='rounded-xl border border-neutral-800 bg-neutral-900/60 p-4'
					>
						<div className='flex items-center justify-between'>
							<p className='text-sm text-neutral-400'>
								{item.label}
							</p>
							<span className='text-lg font-semibold text-white'>
								{item.value}
							</span>
						</div>
						<p className='mt-2 text-sm text-neutral-500'>
							{item.description}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
