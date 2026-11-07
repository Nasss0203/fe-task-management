"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
	getActivityActorName,
	getActivityPresentation,
	getActivityValueChange,
	groupActivitiesByDay,
} from "@/entities/activity/lib/activity-presentation";
import { usePageActivities } from "@/entities/activity/model/activity.queries";
import type { ActivityItem } from "@/entities/activity/model/activity.types";
import {
	formatDatabaseValue,
	PropertyIcon,
	PropertyOptionBadge,
} from "@/entities/database/ui/database-visuals";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";

interface PageActivityButtonProps {
	workspaceId: string;
	pageId: string;
}

export function PageActivityButton({
	workspaceId,
	pageId,
	open,
	onOpenChange: setOpen,
}: PageActivityButtonProps & {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent side='right' className='w-full gap-0 sm:max-w-sm'>
				<SheetHeader className='border-b'>
					<SheetTitle>Activity</SheetTitle>
					<SheetDescription>Changes made on this page.</SheetDescription>
				</SheetHeader>

				{open && (
					<PageActivityList
						workspaceId={workspaceId}
						pageId={pageId}
						onNavigate={() => setOpen(false)}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}

function PageActivityList({
	workspaceId,
	pageId,
	onNavigate,
}: PageActivityButtonProps & { onNavigate: () => void }) {
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
							<PageActivityRow
								key={item.id}
								activity={item}
								pageId={pageId}
								onNavigate={onNavigate}
							/>
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

function rowLink(activity: ActivityItem, pageId: string): string | null {
	const openable =
		activity.entityType === "DATABASE_ROW" &&
		activity.action !== "DATABASE_ROW_DELETED" &&
		typeof activity.target?.rowTitle === "string";
	return openable ? `/page/${pageId}?row=${activity.entityId}` : null;
}

function PageActivityValue({ activity }: { activity: ActivityItem }) {
	const change = getActivityValueChange(activity);
	if (!change) return null;

	let value: ReactNode = null;
	if (change.cleared) {
		value = <span className='text-faint'>Cleared</span>;
	} else if (change.options.length > 0) {
		value = change.options.map((option) => (
			<PropertyOptionBadge
				key={option.id}
				name={option.name}
				color={option.color}
			/>
		));
	} else if (change.people.length > 0) {
		value = <span>{change.people.join(", ")}</span>;
	} else if (typeof change.value === "boolean") {
		value = <span>{change.value ? "Checked" : "Unchecked"}</span>;
	} else if (change.value !== null && !Array.isArray(change.value)) {
		value = (
			<span className='truncate'>{formatDatabaseValue(change.value)}</span>
		);
	}

	return (
		<div className='mt-1.5 space-y-1'>
			<p className='flex items-center gap-1 text-xs text-muted-foreground'>
				<PropertyIcon
					type={change.propertyType ?? "TEXT"}
					className='size-3.5'
				/>
				{change.propertyName}
			</p>
			{value && (
				<div className='flex min-w-0 flex-wrap items-center gap-1 text-sm'>
					{value}
				</div>
			)}
		</div>
	);
}

function PageActivityRow({
	activity,
	pageId,
	onNavigate,
}: {
	activity: ActivityItem;
	pageId: string;
	onNavigate: () => void;
}) {
	const name = getActivityActorName(activity.actor);
	const { icon: Icon, text, subject } = getActivityPresentation(activity);
	const href = rowLink(activity, pageId);

	const body = (
		<>
			<Avatar className='mt-0.5 size-6 shrink-0'>
				<AvatarFallback className='bg-ring text-[10px] font-semibold text-white'>
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className='min-w-0 flex-1'>
				<p className='leading-snug'>
					<span className='font-medium'>{name}</span>{" "}
					<span className='text-muted-foreground'>{text}</span>
					{subject && <span className='font-medium'> {subject}</span>}
				</p>
				<p className='mt-0.5 flex items-center gap-1 text-xs text-faint'>
					<Icon className='size-3' />
					{formatRelativeTime(activity.createdAt)}
				</p>
				<PageActivityValue activity={activity} />
			</div>
		</>
	);

	return (
		<li className='text-sm'>
			{href ? (
				<Link
					href={href}
					onClick={onNavigate}
					className='-mx-2 flex items-start gap-2.5 rounded-md px-2 py-1 hover:bg-accent'
				>
					{body}
				</Link>
			) : (
				<div className='flex items-start gap-2.5 py-1'>{body}</div>
			)}
		</li>
	);
}
