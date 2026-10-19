"use client";

import { UserRound } from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/lib/utils";

export function CreatorAvatar({
	src,
	name,
	className,
}: {
	src: string | null;
	name?: string;
	className?: string;
}) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const showImage = Boolean(src) && failedSrc !== src;

	return (
		<div className={cn("overflow-hidden bg-muted", className)}>
			{showImage ? (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={src ?? undefined}
					alt={name ?? ""}
					referrerPolicy='no-referrer'
					onError={() => setFailedSrc(src)}
					className='h-full w-full object-cover'
				/>
			) : (
				<span
					aria-hidden={!name}
					className='flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground'
				>
					{name ? name.charAt(0).toUpperCase() : <UserRound className='size-8' />}
				</span>
			)}
		</div>
	);
}
