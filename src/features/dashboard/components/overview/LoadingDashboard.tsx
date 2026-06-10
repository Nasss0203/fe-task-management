import { Skeleton } from "@/components/ui/skeleton";

export function LoadingDashboard() {
	return (
		<main
			className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
			style={{ maxWidth: "calc(100dvw - 2rem)" }}
		>
			<Skeleton className='h-[168px] w-full rounded-2xl border border-border/50 bg-card/60 shadow-sm' />
			
			<section className='grid min-w-0 gap-6 xl:grid-cols-12'>
				<div className='xl:col-span-8 space-y-6'>
					<div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
						<div className="flex flex-col gap-2 mb-6">
							<Skeleton className="h-6 w-48 rounded-lg" />
							<Skeleton className="h-4 w-64 rounded-lg" />
						</div>
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-28 w-full rounded-xl" />
							))}
						</div>
					</div>
				</div>

				<div className='xl:col-span-4 space-y-6'>
					<div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
						<div className="flex flex-col gap-2 mb-6">
							<Skeleton className="h-6 w-40 rounded-lg" />
							<Skeleton className="h-4 w-56 rounded-lg" />
						</div>
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-[76px] w-full rounded-xl" />
							))}
						</div>
					</div>
				</div>
			</section>

			<section className='grid gap-6 sm:grid-cols-2 xl:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<Skeleton className="h-4 w-20 rounded-lg" />
							<Skeleton className="size-8 rounded-lg" />
						</div>
						<Skeleton className="h-8 w-16 rounded-lg mb-2" />
						<Skeleton className="h-3 w-32 rounded-lg" />
					</div>
				))}
			</section>

			<section className='grid min-w-0 gap-6 xl:grid-cols-12'>
				<div className='xl:col-span-8 space-y-6'>
					<div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
						<div className="flex flex-col gap-2 mb-6">
							<Skeleton className="h-6 w-48 rounded-lg" />
							<Skeleton className="h-4 w-64 rounded-lg" />
						</div>
						<div className="space-y-5">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="flex gap-4">
									<div className="flex flex-col items-center">
										<Skeleton className="size-3 rounded-full" />
										<Skeleton className="mt-2 h-10 w-px" />
									</div>
									<div className="flex-1 space-y-2 pb-2">
										<Skeleton className="h-4 w-3/4 rounded-lg" />
										<Skeleton className="h-3 w-1/4 rounded-lg" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className='xl:col-span-4 space-y-6'>
					<div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
						<div className="flex flex-col gap-2 mb-6">
							<Skeleton className="h-6 w-40 rounded-lg" />
							<Skeleton className="h-4 w-56 rounded-lg" />
						</div>
						<div className="space-y-3">
							{Array.from({ length: 2 }).map((_, i) => (
								<Skeleton key={i} className="h-14 w-full rounded-xl" />
							))}
							<Skeleton className="h-20 w-full rounded-xl mt-4" />
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
