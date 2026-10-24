"use client";

import {
	Ban,
	CheckCircle2,
	Clock,
	RotateCw,
	Users,
	XCircle,
	type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
	useAcceptTeamspaceInvitation,
	useDeclineTeamspaceInvitation,
} from "@/entities/teamspace/model/teamspace.mutations";
import { useMyTeamspaceInvitations } from "@/entities/teamspace/model/teamspace.queries";
import type {
	MyTeamspaceInvitation,
	TeamspaceInvitationStatus,
} from "@/entities/teamspace/model/teamspace.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

const STATUS_PRESENTATION: Record<
	Exclude<TeamspaceInvitationStatus, "PENDING">,
	{ label: string; icon: LucideIcon; className: string }
> = {
	ACCEPTED: {
		label: "Joined",
		icon: CheckCircle2,
		className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	},
	DECLINED: {
		label: "Declined",
		icon: XCircle,
		className: "bg-muted text-muted-foreground",
	},
	EXPIRED: {
		label: "Expired",
		icon: Clock,
		className: "bg-muted text-muted-foreground",
	},
	REVOKED: {
		label: "Revoked",
		icon: Ban,
		className: "bg-muted text-muted-foreground",
	},
};

export function TeamspaceInvitationsPage() {
	const {
		data: invitations = [],
		isLoading,
		isError,
		refetch,
	} = useMyTeamspaceInvitations();

	const acceptMutation = useAcceptTeamspaceInvitation();

	const declineMutation = useDeclineTeamspaceInvitation();

	const pending = invitations.filter(
		(invitation) => invitation.status === "PENDING",
	);

	const history = invitations.filter(
		(invitation) => invitation.status !== "PENDING",
	);

	// One response at a time keeps every row's pending state accurate.
	const isResponding = acceptMutation.isPending || declineMutation.isPending;

	const handleAccept = (invitation: MyTeamspaceInvitation) => {
		acceptMutation.mutate(invitation.id, {
			onSuccess: () => {
				toast.success(`You joined ${invitation.teamspaceName}`, {
					description: `Find it in the ${invitation.workspaceName} sidebar.`,
				});
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Could not accept the invitation."),
				);
			},
		});
	};

	const handleDecline = (invitation: MyTeamspaceInvitation) => {
		declineMutation.mutate(invitation.id, {
			onSuccess: () => {
				toast.success(`Declined ${invitation.teamspaceName}`);
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Could not decline the invitation."),
				);
			},
		});
	};

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 sm:px-6 lg:px-8'>
			<header className='flex flex-col gap-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Teamspace invitations
				</h1>

				<p className='text-sm text-muted-foreground'>
					Join the teamspaces you were invited to, or decline the
					ones you don&apos;t need.
				</p>
			</header>

			{isLoading ? (
				<InvitationListSkeleton />
			) : isError ? (
				<div
					role='alert'
					className='flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center'
				>
					<p className='text-sm text-muted-foreground'>
						Unable to load your invitations.
					</p>

					<Button
						variant='outline'
						size='sm'
						onClick={() => refetch()}
					>
						<RotateCw className='size-3.5' />
						Try again
					</Button>
				</div>
			) : (
				<>
					<section
						aria-labelledby='pending-invitations-heading'
						className='flex flex-col gap-3'
					>
						<h2
							id='pending-invitations-heading'
							className='flex items-center gap-2 text-sm font-medium'
						>
							Pending
							<span className='rounded-full bg-muted px-2 text-xs tabular-nums text-muted-foreground'>
								{pending.length}
							</span>
						</h2>

						{pending.length === 0 ? (
							<div className='flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center'>
								<span className='flex size-11 items-center justify-center rounded-xl bg-muted'>
									<Users className='size-5 text-muted-foreground' />
								</span>

								<div className='flex flex-col gap-1'>
									<p className='text-sm font-medium'>
										No pending invitations
									</p>

									<p className='max-w-sm text-sm text-muted-foreground'>
										When someone invites you to a teamspace,
										it will show up here.
									</p>
								</div>
							</div>
						) : (
							<ul className='flex flex-col gap-3'>
								{pending.map((invitation) => (
									<PendingInvitationCard
										key={invitation.id}
										invitation={invitation}
										disabled={isResponding}
										isAccepting={
											acceptMutation.isPending &&
											acceptMutation.variables ===
												invitation.id
										}
										isDeclining={
											declineMutation.isPending &&
											declineMutation.variables ===
												invitation.id
										}
										onAccept={handleAccept}
										onDecline={handleDecline}
									/>
								))}
							</ul>
						)}
					</section>

					{history.length > 0 && (
						<section
							aria-labelledby='invitation-history-heading'
							className='flex flex-col gap-3'
						>
							<h2
								id='invitation-history-heading'
								className='text-sm font-medium'
							>
								History
							</h2>

							<ul className='divide-y rounded-xl border'>
								{history.map((invitation) => (
									<HistoryRow
										key={invitation.id}
										invitation={invitation}
									/>
								))}
							</ul>
						</section>
					)}
				</>
			)}
		</div>
	);
}

interface PendingInvitationCardProps {
	invitation: MyTeamspaceInvitation;
	disabled: boolean;
	isAccepting: boolean;
	isDeclining: boolean;
	onAccept: (invitation: MyTeamspaceInvitation) => void;
	onDecline: (invitation: MyTeamspaceInvitation) => void;
}

function PendingInvitationCard({
	invitation,
	disabled,
	isAccepting,
	isDeclining,
	onAccept,
	onDecline,
}: PendingInvitationCardProps) {
	return (
		<li className='flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center'>
			<div className='flex min-w-0 flex-1 items-start gap-3'>
				<TeamspaceIcon icon={invitation.teamspaceIcon} />

				<div className='min-w-0 flex-1'>
					<p className='truncate font-medium'>
						{invitation.teamspaceName}
					</p>

					<p className='mt-0.5 break-words text-sm text-muted-foreground'>
						{invitation.workspaceName}
						{invitation.inviterName && (
							<>
								{" · Invited by "}
								<span className='text-foreground'>
									{invitation.inviterName}
								</span>
							</>
						)}
					</p>

					<p className='mt-1.5 flex items-center gap-1 text-xs text-muted-foreground'>
						<Clock className='size-3' />
						Expires{" "}
						<time dateTime={invitation.expiresAt}>
							{dateFormatter.format(new Date(invitation.expiresAt))}
						</time>
					</p>
				</div>
			</div>

			<div className='flex gap-2 sm:shrink-0'>
				<Button
					variant='outline'
					size='sm'
					className='flex-1 sm:flex-none'
					disabled={disabled}
					onClick={() => onDecline(invitation)}
				>
					{isDeclining ? "Declining..." : "Decline"}
				</Button>

				<Button
					size='sm'
					className='flex-1 sm:flex-none'
					disabled={disabled}
					onClick={() => onAccept(invitation)}
				>
					{isAccepting ? "Accepting..." : "Accept"}
				</Button>
			</div>
		</li>
	);
}

function HistoryRow({ invitation }: { invitation: MyTeamspaceInvitation }) {
	const status =
		STATUS_PRESENTATION[
			invitation.status as Exclude<TeamspaceInvitationStatus, "PENDING">
		];

	const StatusIcon = status.icon;

	return (
		<li className='flex items-center gap-3 px-4 py-3'>
			<TeamspaceIcon icon={invitation.teamspaceIcon} size='sm' />

			<div className='min-w-0 flex-1'>
				<p className='truncate text-sm font-medium'>
					{invitation.teamspaceName}
				</p>

				<p className='truncate text-xs text-muted-foreground'>
					{invitation.workspaceName} ·{" "}
					<time dateTime={invitation.createdAt}>
						{dateFormatter.format(new Date(invitation.createdAt))}
					</time>
				</p>
			</div>

			<span
				className={cn(
					"inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
					status.className,
				)}
			>
				<StatusIcon className='size-3' />
				{status.label}
			</span>
		</li>
	);
}

function TeamspaceIcon({
	icon,
	size = "md",
}: {
	icon: string | null;
	size?: "sm" | "md";
}) {
	return (
		<span
			aria-hidden='true'
			className={cn(
				"flex shrink-0 items-center justify-center rounded-lg bg-teal-500/10",
				size === "md" ? "size-10 text-lg" : "size-8 text-base",
			)}
		>
			{icon || "🏠"}
		</span>
	);
}

function InvitationListSkeleton() {
	return (
		<div className='flex flex-col gap-3' aria-busy='true'>
			<span className='sr-only'>Loading invitations</span>

			{Array.from({ length: 2 }, (_, index) => (
				<div
					key={index}
					className='flex items-center gap-3 rounded-xl border p-4'
				>
					<Skeleton className='size-10 rounded-lg' />

					<div className='flex-1 space-y-2'>
						<Skeleton className='h-4 w-2/5' />
						<Skeleton className='h-3 w-3/5' />
					</div>

					<Skeleton className='h-8 w-36' />
				</div>
			))}
		</div>
	);
}
