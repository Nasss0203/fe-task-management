import React from "react";
import { Skeleton } from "@/shared/ui/skeleton";

interface TemplateCardSkeletonProps {
	count?: number;
}

export function TemplateCardSkeleton({ count = 6 }: TemplateCardSkeletonProps) {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full'>
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className='flex flex-col h-full rounded-2xl border border-border/80 bg-card p-4 shadow-xs'
				>
					{/* Preview Skeleton */}
					<div className='relative h-44 w-full shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20 mb-3.5 flex flex-col justify-between p-4'>
						<div className='flex items-center justify-between'>
							<Skeleton className='h-3 w-20 rounded' />
							<Skeleton className='h-3 w-12 rounded' />
						</div>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-3/4 rounded' />
							<Skeleton className='h-2.5 w-full rounded' />
							<Skeleton className='h-2.5 w-5/6 rounded' />
						</div>
						<div className='flex items-center justify-between pt-2 border-t border-border/40'>
							<Skeleton className='h-2.5 w-16 rounded' />
							<Skeleton className='h-2.5 w-10 rounded' />
						</div>
					</div>

					{/* Meta Row Skeleton */}
					<div className='flex items-center justify-between mb-2'>
						<Skeleton className='h-4 w-16 rounded-md' />
						<Skeleton className='h-3 w-20 rounded' />
					</div>

					{/* Title & Description Skeleton */}
					<div className='flex flex-col flex-1 space-y-2'>
						<Skeleton className='h-5 w-2/3 rounded-md' />
						<Skeleton className='h-3 w-full rounded' />
						<Skeleton className='h-3 w-4/5 rounded' />

						{/* Action Buttons Skeleton */}
						<div className='mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2'>
							<Skeleton className='h-8 flex-1 rounded-lg' />
							<Skeleton className='h-8 flex-1 rounded-lg' />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
