import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { StatItem } from "./types";

type Props = {
	item: StatItem;
};

export function StatCard({ item }: Props) {
	const Icon = item.icon;

	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-sm'>
			<div className='flex items-start justify-between'>
				<div>
					<p className='text-sm text-neutral-400'>{item.title}</p>
					<h3 className='mt-2 text-2xl font-semibold text-white'>
						{item.value}
					</h3>
				</div>

				<div className='rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-300'>
					<Icon className='h-5 w-5' />
				</div>
			</div>

			<div className='mt-4 flex items-center gap-2 text-sm'>
				<span
					className={`inline-flex items-center gap-1 ${
						item.trend === "down"
							? "text-red-400"
							: item.trend === "neutral"
								? "text-neutral-400"
								: "text-emerald-400"
					}`}
				>
					{item.trend === "down" ? (
						<ArrowDownRight className='h-4 w-4' />
					) : item.trend === "neutral" ? (
						<Minus className='h-4 w-4' />
					) : (
						<ArrowUpRight className='h-4 w-4' />
					)}
					{item.change}
				</span>

				<span className='text-neutral-500'>{item.description}</span>
			</div>
		</div>
	);
}