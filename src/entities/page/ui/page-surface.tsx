import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

export function PageCover({
	url,
	title = "",
}: {
	url: string;
	title?: string;
}) {
	return (
		<div className='h-64 w-full overflow-hidden'>
			{/* Cover URLs can use arbitrary hosts. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={url} alt={title} className='h-full w-full object-cover' />
		</div>
	);
}

export function PageHeader({
	icon,
	title,
	className,
}: {
	icon?: string | null;
	title?: string | null;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-1 px-12 pt-10 md:px-16 lg:px-24",
				className,
			)}
		>
			<div className='mb-3 text-5xl'>{icon || "📄"}</div>
			<h1 className='text-4xl font-bold'>{title || "Untitled"}</h1>
		</div>
	);
}

export function PageContent({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"mt-14 w-full min-w-0 max-w-full px-12 md:px-16 lg:px-24",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function PageSkeleton() {
	return (
		<div role='status' aria-label='Loading page' className='w-full min-w-0'>
			<div className='flex items-center gap-3 px-12 pt-10 md:px-16 lg:px-24'>
				<Skeleton className='size-12 rounded-lg' />
				<Skeleton className='h-9 w-2/5 max-w-sm' />
			</div>
			<PageContent className='space-y-3'>
				{["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3", "w-3/4"].map(
					(width, index) => (
						<Skeleton key={index} className={cn("h-4", width)} />
					),
				)}
			</PageContent>
		</div>
	);
}
