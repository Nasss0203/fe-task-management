import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

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
