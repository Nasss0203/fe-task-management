import { Database, Table2 } from "lucide-react";

const DatabaseRecommend = ({
	title,
	onClick,
}: {
	title: string;
	onClick?: () => void;
}) => {
	return (
		<button
			type='button'
			onClick={onClick}
			className='group relative w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-neutral-900 cursor-pointer'
		>
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_45%)]' />
			<div className='absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]' />

			<div className='relative flex min-h-55 flex-col justify-between gap-4'>
				<div className='space-y-3'>
					<div className='flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-300'>
						<Database size={16} />
					</div>
				</div>

				<div className='rounded-xl border border-amber-500/15 bg-amber-500/10 p-3 backdrop-blur-sm transition-all duration-300 group-hover:border-amber-400/25 group-hover:bg-amber-500/12'>
					<div className='mb-3 flex items-center gap-2 text-amber-100'>
						<div className='flex h-7 w-7 items-center justify-center rounded-md bg-amber-400/15'>
							<Table2 size={14} />
						</div>
						<span className='text-xs font-medium'>{title}</span>
					</div>

					<div className='space-y-2'>
						<div className='grid grid-cols-3 gap-2'>
							<div className='h-2 w-12 rounded bg-neutral-500/30' />
							<div className='h-2 w-14 rounded bg-neutral-500/20' />
							<div className='h-2 w-10 rounded bg-neutral-500/20' />
						</div>

						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className='grid grid-cols-3 gap-2 rounded-md border border-white/5 bg-black/10 px-2.5 py-2'
							>
								<div className='h-2 w-10 rounded bg-neutral-400/20' />
								<div className='h-2 w-12 rounded bg-neutral-400/15' />
								<div className='h-2 w-9 rounded bg-neutral-400/15' />
							</div>
						))}
					</div>
				</div>
			</div>
		</button>
	);
};

export default DatabaseRecommend;
