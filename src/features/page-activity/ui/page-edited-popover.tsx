"use client";

import { useState } from "react";

import { getActivityActorName } from "@/entities/activity/lib/activity-presentation";
import { usePageActivitySummary } from "@/entities/activity/model/activity.queries";
import type {
	ActivityMoment,
	PageActivitySummary,
} from "@/entities/activity/model/activity.types";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Skeleton } from "@/shared/ui/skeleton";

interface PageEditedPopoverProps {
	workspaceId: string;
	pageId: string;
	editedAt: string;
	onOpenActivity: () => void;
}

export function PageEditedPopover({
	workspaceId,
	pageId,
	editedAt,
	onOpenActivity,
}: PageEditedPopoverProps) {
	const [open, setOpen] = useState(false);
	const { data, isPending, isError } = usePageActivitySummary(
		workspaceId,
		pageId,
		open,
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className='mr-1 hidden rounded-md px-1.5 py-0.5 text-[12.5px] text-faint hover:bg-accent md:inline-block'
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
				onClick={(event) => {
					event.preventDefault();
					setOpen(false);
					onOpenActivity();
				}}
			>
				Edited {editedAt}
			</PopoverTrigger>
			<PopoverContent
				align='end'
				className='w-64 p-1.5'
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
			>
				{isPending ? (
					<Skeleton className='h-9 w-full' />
				) : isError ? (
					<p className='p-1.5 text-sm text-muted-foreground'>
						Could not load activity.
					</p>
				) : (
					<ul>
						{groupByActor(data).map((group) => (
							<PageEditedActor
								key={group.key}
								actor={group.actor}
								moments={group.moments}
							/>
						))}
					</ul>
				)}
			</PopoverContent>
		</Popover>
	);
}

interface ActorGroup {
	key: string;
	actor: ActivityMoment["actor"];
	moments: string[];
}

function groupByActor(summary: PageActivitySummary): ActorGroup[] {
	const groups: ActorGroup[] = [];
	const add = (moment: ActivityMoment | null, text: (at: string) => string) => {
		if (!moment) return;
		const key = moment.actor?.id ?? "unknown";
		const group = groups.find((item) => item.key === key);
		if (group) group.moments.push(text(moment.at));
		else groups.push({ key, actor: moment.actor, moments: [text(moment.at)] });
	};

	add(summary.lastEdited, (at) => `Edited ${formatRelativeTime(at)}`);
	add(
		summary.created,
		(at) =>
			`Created ${new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
	);
	return groups;
}

function PageEditedActor({ actor, moments }: Omit<ActorGroup, "key">) {
	const name = getActivityActorName(actor);

	return (
		<li className='flex items-center gap-2.5 rounded-md px-1.5 py-1'>
			<Avatar className='size-6 shrink-0'>
				<AvatarFallback className='bg-ring text-[10px] font-semibold text-white'>
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className='min-w-0 flex-1'>
				<p className='truncate text-sm font-medium'>{name}</p>
				<p className='truncate text-xs text-faint'>{moments.join(" · ")}</p>
			</div>
		</li>
	);
}
