"use client";

import { CalendarDays, CalendarSync, Copy, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { calendarFeedUrl } from "@/entities/database/api/database.api";
import {
	useRevokeCalendarFeed,
	useUpsertCalendarFeed,
} from "@/entities/database/model/database.mutations";
import { useCalendarFeed } from "@/entities/database/model/database.queries";
import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { MenuItem, MenuSectionLabel, MenuSeparator } from "./menu-item";
import { toolbarIconButtonClass } from "./toolbar-button";

interface DatabaseCalendarFeedPopoverProps {
	databaseId: string;
	properties: DatabaseProperty[];
}

export function DatabaseCalendarFeedPopover({
	databaseId,
	properties,
}: DatabaseCalendarFeedPopoverProps) {
	const [open, setOpen] = useState(false);
	const { data: feed, isLoading } = useCalendarFeed(databaseId, open);
	const upsertMutation = useUpsertCalendarFeed(databaseId);
	const revokeMutation = useRevokeCalendarFeed(databaseId);

	const dateProperties = [...properties]
		.filter((property) => property.type === PropertyType.DATE)
		.sort((a, b) => Number(a.position) - Number(b.position));
	const url = feed ? calendarFeedUrl(feed.token) : null;
	const busy = upsertMutation.isPending || revokeMutation.isPending;

	const subscribe = (datePropertyId: string) =>
		upsertMutation.mutate(datePropertyId, {
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Couldn't create the calendar link"),
				),
		});

	const copyLink = async () => {
		if (!url) return;

		try {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied");
		} catch {
			toast.error("Could not copy. Select the link and copy it manually.");
		}
	};

	const resetLink = () => {
		if (!feed) return;

		revokeMutation.mutate(undefined, {
			onSuccess: () => subscribe(feed.datePropertyId),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't reset the link")),
		});
	};

	const stopSharing = () =>
		revokeMutation.mutate(undefined, {
			onSuccess: () => toast.success("Calendar link turned off"),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't turn off the link")),
		});

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='Subscribe in a calendar app'
					title='Subscribe in a calendar app'
					className={toolbarIconButtonClass(Boolean(feed))}
				>
					<CalendarSync className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-80 p-[5px]'>
				<MenuSectionLabel>Subscribe by date</MenuSectionLabel>

				{dateProperties.length === 0 ? (
					<p className='px-2 py-1.5 text-[13px] text-muted-foreground'>
						Add a Date property to subscribe in a calendar app.
					</p>
				) : (
					dateProperties.map((property) => (
						<MenuItem
							key={property.id}
							icon={CalendarDays}
							hint={feed?.datePropertyId === property.id ? "In use" : undefined}
							disabled={busy || isLoading}
							onClick={() => subscribe(property.id)}
						>
							{property.name}
						</MenuItem>
					))
				)}

				{url && (
					<>
						<MenuSeparator />
						<div className='px-2 py-1.5'>
							<Input
								readOnly
								value={url}
								aria-label='Calendar link'
								className='h-8 text-xs'
								onFocus={(event) => event.currentTarget.select()}
							/>
							<p className='mt-1.5 text-xs text-muted-foreground'>
								In Google Calendar: Other calendars, then From URL. Anyone
								with this link can see these dates.
							</p>
						</div>
						<MenuItem icon={Copy} onClick={copyLink}>
							Copy link
						</MenuItem>
						<MenuItem icon={RefreshCw} disabled={busy} onClick={resetLink}>
							Reset link
						</MenuItem>
						<MenuItem
							icon={Trash2}
							destructive
							disabled={busy}
							onClick={stopSharing}
						>
							Turn off link
						</MenuItem>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
