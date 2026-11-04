import { Skeleton } from "@/shared/ui/skeleton";

export function RowsSkeleton() {
	return (
		<div aria-label='Loading'>
			{[0, 1, 2].map((item) => (
				<div key={item} className='flex min-h-14 items-center gap-3 border-b py-2'>
					<Skeleton className='size-8 rounded-full' />
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
