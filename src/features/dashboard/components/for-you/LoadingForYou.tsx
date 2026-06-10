import { Skeleton } from "@/components/ui/skeleton";

export function LoadingForYou() {
	return (
		<main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-10 px-2'>
			<div className='flex w-full min-w-0 flex-col gap-10 max-w-7xl'>
				<header className='border-b border-border/60 pb-6 pt-4'>
					<Skeleton className='h-9 w-40 rounded-lg' />
					<Skeleton className='mt-3 h-5 w-96 rounded-md' />
				</header>

				<section className='space-y-5'>
					<div className='flex items-center justify-between gap-4 px-1'>
						<Skeleton className='h-5 w-32 rounded-md' />
						<Skeleton className='h-4 w-24 rounded-md' />
					</div>

					<div className='grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className='flex flex-col h-[220px] rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm'>
								<div className="flex items-start gap-3">
									<Skeleton className="size-8 rounded-lg" />
									<div className="space-y-2 flex-1 mt-0.5">
										<Skeleton className="h-4 w-3/4 rounded-md" />
										<Skeleton className="h-3 w-1/2 rounded-md" />
									</div>
								</div>
								<div className="mt-6 flex-1 space-y-3">
									<Skeleton className="h-3 w-20 rounded-md" />
									<Skeleton className="h-8 w-full rounded-md" />
									<Skeleton className="h-8 w-full rounded-md" />
								</div>
								<Skeleton className="mt-4 h-4 w-24 rounded-md" />
							</div>
						))}
					</div>
				</section>

				<section className='min-w-0'>
					<div className='flex gap-6 border-b border-border/60 pb-3'>
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} className='h-6 w-32 rounded-md' />
						))}
					</div>

					<div className='pt-6'>
						<Skeleton className='mb-4 h-4 w-28 rounded-md' />

						<div className='flex flex-col gap-1'>
							{Array.from({ length: 5 }).map((_, index) => (
								<div key={index} className='flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/40'>
									<div className='flex items-center gap-3'>
										<Skeleton className='size-4 rounded-sm' />
										<Skeleton className='h-4 w-64 rounded-md' />
										<Skeleton className='h-5 w-16 rounded-full' />
									</div>
									<div className='flex items-center gap-4'>
										<Skeleton className='h-4 w-32 rounded-md' />
										<Skeleton className='h-6 w-20 rounded-full' />
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
