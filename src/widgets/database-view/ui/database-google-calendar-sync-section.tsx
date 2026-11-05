"use client";

import {
	CalendarDays,
	Clock,
	LogIn,
	RefreshCw,
	Trash2,
	Unlink,
	UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
	useConnectGoogleCalendar,
	useDeleteGoogleCalendarSync,
	useDisconnectGoogleCalendar,
	useRunGoogleCalendarSync,
	useUpsertGoogleCalendarSync,
} from "@/entities/database/model/database.mutations";
import { useGoogleCalendarSync } from "@/entities/database/model/database.queries";
import type {
	DatabaseProperty,
	GoogleCalendarSyncError,
} from "@/entities/database/model/database.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

import { MenuItem, MenuSectionLabel } from "./menu-item";

const SYNC_ERROR_MESSAGES: Record<GoogleCalendarSyncError, string> = {
	ACCESS_REVOKED: "Google access was revoked. Reconnect to keep syncing.",
	ACCESS_LOST: "You no longer have access to this database.",
	DATE_PROPERTY_MISSING:
		"The synced Date property was removed or changed. Pick another one.",
	CALENDAR_MISSING:
		"The Google calendar was deleted. Pick a Date property to create it again.",
	GOOGLE_ERROR: "Google did not respond. The next sync will retry.",
};

interface DatabaseGoogleCalendarSyncSectionProps {
	databaseId: string;
	dateProperties: DatabaseProperty[];
	hasPersonProperty: boolean;
	enabled: boolean;
}

export function DatabaseGoogleCalendarSyncSection({
	databaseId,
	dateProperties,
	hasPersonProperty,
	enabled,
}: DatabaseGoogleCalendarSyncSectionProps) {
	const { data: status, isLoading } = useGoogleCalendarSync(databaseId, enabled);
	const connectMutation = useConnectGoogleCalendar();
	const disconnectMutation = useDisconnectGoogleCalendar();
	const upsertMutation = useUpsertGoogleCalendarSync(databaseId);
	const deleteMutation = useDeleteGoogleCalendarSync(databaseId);
	const runMutation = useRunGoogleCalendarSync(databaseId);

	const busy =
		connectMutation.isPending ||
		disconnectMutation.isPending ||
		upsertMutation.isPending ||
		deleteMutation.isPending ||
		runMutation.isPending;
	const needsConnect = !status?.connected || Boolean(status.connectionError);
	const sync = status?.sync ?? null;
	const syncError = status?.connectionError ?? sync?.lastError ?? null;

	const connect = () =>
		connectMutation.mutate(
			`${window.location.pathname}${window.location.search}`,
			{
				onSuccess: (url) => window.location.assign(url),
				onError: (error) =>
					toast.error(getApiErrorMessage(error, "Couldn't open Google sign-in")),
			},
		);

	const startSync = (datePropertyId: string) =>
		upsertMutation.mutate(
			{ datePropertyId },
			{
				onSuccess: () => toast.success("Syncing to Google Calendar"),
				onError: (error) =>
					toast.error(getApiErrorMessage(error, "Couldn't sync to Google Calendar")),
			},
		);

	const toggleAssignedToMeOnly = () => {
		if (!sync) return;
		upsertMutation.mutate(
			{
				datePropertyId: sync.datePropertyId,
				assignedToMeOnly: !sync.assignedToMeOnly,
			},
			{
				onSuccess: () =>
					toast.success(
						sync.assignedToMeOnly
							? "Syncing every dated row"
							: "Syncing only rows assigned to you",
					),
				onError: (error) =>
					toast.error(getApiErrorMessage(error, "Couldn't change the sync")),
			},
		);
	};

	const syncNow = () =>
		runMutation.mutate(undefined, {
			onSuccess: () => toast.success("Sync started"),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't start the sync")),
		});

	const stopSync = () =>
		deleteMutation.mutate(undefined, {
			onSuccess: () => toast.success("Google Calendar sync turned off"),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't turn off the sync")),
		});

	const disconnect = () =>
		disconnectMutation.mutate(undefined, {
			onSuccess: () => toast.success("Google Calendar disconnected"),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't disconnect Google")),
		});

	return (
		<div className='space-y-1'>
			<div className='flex items-center justify-between px-2 pb-0.5 pt-0.5'>
				<MenuSectionLabel>Sync to Google Calendar</MenuSectionLabel>
				<span className='rounded border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground'>
					2-way
				</span>
			</div>

			{status?.googleEmail && (
				<div className='mx-1.5 mb-1 flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5'>
					<div className='flex min-w-0 items-center gap-2'>
						<span className='size-1.5 shrink-0 rounded-full bg-emerald-500' />
						<p className='truncate text-xs font-medium text-foreground'>
							{status.googleEmail}
						</p>
					</div>
					<span className='shrink-0 text-[10px] font-medium text-muted-foreground'>
						Connected
					</span>
				</div>
			)}

			{syncError && (
				<p
					role='alert'
					className='mx-1.5 my-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs leading-relaxed text-destructive'
				>
					{SYNC_ERROR_MESSAGES[syncError]}
				</p>
			)}

			{needsConnect ? (
				<MenuItem icon={LogIn} disabled={busy || isLoading} onClick={connect}>
					{status?.connected ? "Reconnect Google Calendar" : "Connect Google Calendar"}
				</MenuItem>
			) : (
				<>
					<div className='space-y-0.5'>
						{dateProperties.map((property) => {
							const isSyncing = sync?.datePropertyId === property.id;
							return (
								<MenuItem
									key={property.id}
									icon={CalendarDays}
									active={isSyncing}
									hint={
										isSyncing ? (
											<span className='inline-flex items-center gap-1.5 rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/15 px-2 py-0.5 text-[11px] font-medium text-[#5e6ad2] dark:text-indigo-300'>
												<span className='size-1.5 rounded-full bg-[#5e6ad2] dark:bg-indigo-400' />
												Syncing
											</span>
										) : undefined
									}
									disabled={busy}
									onClick={() => startSync(property.id)}
								>
									{property.name}
								</MenuItem>
							);
						})}
					</div>

					{sync && (
						<div className='mt-1.5 rounded-lg border border-border/70 bg-muted/25 p-1.5 space-y-1'>
							<div className='flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-[11px] text-muted-foreground border border-border/50'>
								<Clock className='size-3 shrink-0 text-muted-foreground' />
								<p className='truncate'>
									{sync.lastSyncedAt
										? `Last synced ${new Date(sync.lastSyncedAt).toLocaleString()}`
										: "Waiting for the first sync"}
								</p>
							</div>

							<div className='space-y-0.5 pt-0.5'>
								{(hasPersonProperty || sync.assignedToMeOnly) && (
									<MenuItem
										icon={UserRoundCheck}
										role='menuitemcheckbox'
										aria-checked={sync.assignedToMeOnly}
										hint={
											<span
												className={
													sync.assignedToMeOnly
														? "inline-flex items-center rounded-full bg-[#5e6ad2] px-2 py-0.5 text-[10px] font-semibold text-white"
														: "inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
												}
											>
												{sync.assignedToMeOnly ? "On" : "Off"}
											</span>
										}
										disabled={busy}
										onClick={toggleAssignedToMeOnly}
									>
										Only rows assigned to me
									</MenuItem>
								)}
								<MenuItem icon={RefreshCw} disabled={busy} onClick={syncNow}>
									Sync now
								</MenuItem>
								<MenuItem icon={Trash2} destructive disabled={busy} onClick={stopSync}>
									Turn off sync
								</MenuItem>
							</div>
						</div>
					)}
				</>
			)}

			{status?.connected && (
				<div className='pt-0.5'>
					<MenuItem icon={Unlink} destructive disabled={busy} onClick={disconnect}>
						Disconnect Google
					</MenuItem>
				</div>
			)}
		</div>
	);
}
