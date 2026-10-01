"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { getTimeGreeting } from "../lib/format-relative-time";

interface WorkspaceWelcomeProps {
	workspaceName?: string;
	userName?: string;
	isLoading?: boolean;
}

export function WorkspaceWelcome({
	workspaceName,
	userName = "there",
	isLoading = false,
}: WorkspaceWelcomeProps) {
	const greeting = getTimeGreeting();

	if (isLoading) {
		return (
			<div className='space-y-2'>
				<Skeleton className='h-8 w-56 sm:h-9' />
				<Skeleton className='h-5 w-40' />
			</div>
		);
	}

	return (
		<div className='space-y-1'>
			<h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
				{workspaceName || "Workspace"}
			</h1>
			<p className='text-sm text-muted-foreground sm:text-base'>
				{greeting}, {userName}
			</p>
		</div>
	);
}
