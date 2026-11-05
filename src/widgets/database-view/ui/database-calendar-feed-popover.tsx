"use client";

import { CalendarDays, CalendarSync, Copy, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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

import { DatabaseGoogleCalendarSyncSection } from "./database-google-calendar-sync-section";
import { MenuItem, MenuSectionLabel } from "./menu-item";
import { toolbarIconButtonClass } from "./toolbar-button";

const GOOGLE_CALENDAR_PARAM = "googleCalendar";

function useGoogleCalendarRedirectToast() {
	useEffect(() => {
		const url = new URL(window.location.href);
		const result = url.searchParams.get(GOOGLE_CALENDAR_PARAM);

		if (!result) return;

		if (result === "connected") {
			toast.success("Google Calendar connected. Pick a Date property to sync.", {
				id: GOOGLE_CALENDAR_PARAM,
			});
		} else {
			toast.error("Couldn't connect Google Calendar", { id: GOOGLE_CALENDAR_PARAM });
		}

		url.searchParams.delete(GOOGLE_CALENDAR_PARAM);
		window.history.replaceState(window.history.state, "", url.toString());
	}, []);
}

interface DatabaseCalendarFeedPopoverProps {
	databaseId: string;
	properties: DatabaseProperty[];
}

export function DatabaseCalendarFeedPopover({
	databaseId,
	properties,
}: DatabaseCalendarFeedPopoverProps) {
	const [open, setOpen] = useState(false);
	useGoogleCalendarRedirectToast();
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

			<PopoverContent
				align='end'
				className='w-[336px] rounded-xl border border-border/80 bg-popover p-2 shadow-xl'
			>
				<div className='flex items-center justify-between px-2 pb-1 pt-1'>
					<MenuSectionLabel>Subscribe by date</MenuSectionLabel>
					<span className='rounded border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground'>
						iCal
					</span>
				</div>

				{dateProperties.length === 0 ? (
					<p className='mx-1.5 my-1 rounded-lg border border-dashed border-border/70 bg-muted/20 px-2.5 py-2 text-xs text-muted-foreground'>
						Add a Date property to subscribe in a calendar app.
					</p>
				) : (
					<div className='space-y-0.5'>
						{dateProperties.map((property) => {
							const isActive = feed?.datePropertyId === property.id;
							return (
								<MenuItem
									key={property.id}
									icon={CalendarDays}
									active={isActive}
									hint={
										isActive ? (
											<span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
												<span className='size-1.5 rounded-full bg-emerald-500' />
												In use
											</span>
										) : undefined
									}
									disabled={busy || isLoading}
									onClick={() => subscribe(property.id)}
								>
									{property.name}
								</MenuItem>
							);
						})}
					</div>
				)}

				{url && (
					<div className='mt-2 rounded-lg border border-border/70 bg-muted/25 p-1.5 space-y-1.5'>
						<div className='px-1 pt-0.5 space-y-1.5'>
							<Input
								readOnly
								value={url}
								aria-label='Calendar link'
								className='h-8 border-border/80 bg-background/90 font-mono text-[11.5px] text-foreground shadow-2xs'
								onFocus={(event) => event.currentTarget.select()}
							/>
							<p className='text-[11px] leading-relaxed text-muted-foreground'>
								In Google Calendar: Other calendars, then From URL. Anyone
								with this link can see these dates.
							</p>
						</div>
						<div className='border-t border-border/50 pt-1 space-y-0.5'>
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
						</div>
					</div>
				)}

				<div className='my-2 border-t border-border/70' />
				<DatabaseGoogleCalendarSyncSection
					databaseId={databaseId}
					dateProperties={dateProperties}
					hasPersonProperty={properties.some(
						(property) => property.type === PropertyType.PERSON,
					)}
					enabled={open}
				/>
			</PopoverContent>
		</Popover>
	);
}
