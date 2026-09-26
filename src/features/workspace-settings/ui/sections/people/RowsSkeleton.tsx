import { Skeleton } from "@/shared/ui/skeleton";

export function RowsSkeleton() {
	return (
		<div aria-label='Loading' className='divide-y'>
			{[0, 1, 2].map((item) => (
				<div key={item} className='flex items-center gap-3 py-4'>
					<Skeleton className='size-9 rounded-full' />
					<div className='flex-1 space-y-2'>
						<Skeleton className='h-4 w-40' />
						<Skeleton className='h-3 w-56 max-w-full' />
					</div>
					<Skeleton className='h-4 w-24' />
				</div>
			))}
		</div>
	);
}
