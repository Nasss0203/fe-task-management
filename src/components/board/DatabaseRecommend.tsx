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
			className='group relative w-full overflow-hidden rounded-2xl border border-border/50 bg-muted/10 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer'
		>
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.15),transparent_50%)]' />
			<div className='absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]' />

			<div className='relative flex min-h-55 flex-col justify-between gap-4'>
				<div className='space-y-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-background shadow-sm text-amber-500 dark:text-amber-300'>
						<Database size={18} />
					</div>
				</div>

				<div className='rounded-xl border border-amber-500/20 bg-background/50 p-4 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-amber-400/30 group-hover:bg-background/80'>
					<div className='mb-4 flex items-center gap-2.5 text-foreground'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400'>
							<Table2 size={16} />
						</div>
						<span className='text-[14px] font-semibold'>{title}</span>
					</div>

					<div className='space-y-2.5'>
						<div className='grid grid-cols-3 gap-3'>
							<div className='h-2 w-12 rounded-full bg-muted-foreground/30' />
							<div className='h-2 w-14 rounded-full bg-muted-foreground/20' />
							<div className='h-2 w-10 rounded-full bg-muted-foreground/20' />
						</div>

						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className='grid grid-cols-3 gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5'
							>
								<div className='h-2 w-10 rounded-full bg-muted-foreground/40' />
								<div className='h-2 w-12 rounded-full bg-muted-foreground/30' />
								<div className='h-2 w-9 rounded-full bg-muted-foreground/30' />
							</div>
						))}
					</div>
				</div>
			</div>
		</button>
	);
};

export default DatabaseRecommend;
