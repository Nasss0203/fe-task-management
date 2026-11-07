"use client";

import { History } from "lucide-react";
import { useState } from "react";

import {
	getActivityActorName,
	getActivityPresentation,
	groupActivitiesByDay,
} from "@/entities/activity/lib/activity-presentation";
import { usePageActivities } from "@/entities/activity/model/activity.queries";
import type { ActivityItem } from "@/entities/activity/model/activity.types";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";

interface PageActivityButtonProps {
	workspaceId: string;
	pageId: string;
}

export function PageActivityButton({
	workspaceId,
	pageId,
}: PageActivityButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					className='h-7 w-7'
					aria-label='Page activity'
				>
					<History className='size-4' />
				</Button>
			</SheetTrigger>

			<SheetContent side='right' className='w-full gap-0 sm:max-w-sm'>
				<SheetHeader className='border-b'>
					<SheetTitle>Activity</SheetTitle>
					<SheetDescription>Changes made on this page.</SheetDescription>
				</SheetHeader>

				{open && <PageActivityList workspaceId={workspaceId} pageId={pageId} />}
			</SheetContent>
		</Sheet>
	);
}

function PageActivityList({ workspaceId, pageId }: PageActivityButtonProps) {
	const {
		data,
		isPending,
		isError,
		refetch,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = usePageActivities(workspaceId, pageId);

	if (isPending) {
		return (
			<div className='space-y-3 p-4'>
				{Array.from({ length: 5 }, (_, index) => (
					<Skeleton key={index} className='h-9 w-full' />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className='flex flex-col items-center gap-2 p-6 text-sm text-muted-foreground'>
				<p>Could not load activity.</p>
				<Button variant='outline' size='sm' onClick={() => refetch()}>
					Try again
				</Button>
			</div>
		);
	}

	const items = data.pages.flatMap((page) => page.items);

	if (items.length === 0) {
		return (
			<p className='p-6 text-center text-sm text-muted-foreground'>
				No changes on this page yet.
			</p>
		);
	}

	return (
		<div className='flex-1 overflow-y-auto p-4'>
			{groupActivitiesByDay(items).map((group) => (
				<section key={group.label} className='mb-4'>
					<h3 className='mb-2 text-xs font-medium text-muted-foreground'>
						{group.label}
					</h3>
					<ul className='space-y-2.5'>
						{group.items.map((item) => (
							<PageActivityRow key={item.id} activity={item} />
						))}
					</ul>
				</section>
			))}

			{hasNextPage && (
				<Button
					variant='ghost'
					size='sm'
					className='w-full'
					disabled={isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage ? "Loading…" : "Load more"}
				</Button>
			)}
		</div>
	);
}

function PageActivityRow({ activity }: { activity: ActivityItem }) {
	const name = getActivityActorName(activity.actor);
	const { icon: Icon, text } = getActivityPresentation(activity);

	return (
		<li className='flex items-start gap-2.5 text-sm'>
			<Avatar className='mt-0.5 size-6 shrink-0'>
				<AvatarFallback className='bg-ring text-[10px] font-semibold text-white'>
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className='min-w-0 flex-1'>
				<p className='leading-snug'>
					<span className='font-medium'>{name}</span>{" "}
					<span className='text-muted-foreground'>{text}</span>
				</p>
				<p className='mt-0.5 flex items-center gap-1 text-xs text-faint'>
					<Icon className='size-3' />
					{formatRelativeTime(activity.createdAt)}
				</p>
			</div>
		</li>
	);
}
