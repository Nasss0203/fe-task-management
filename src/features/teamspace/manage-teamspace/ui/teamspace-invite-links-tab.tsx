"use client";

import { Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	useCreateTeamspaceInviteLink,
	useRevokeTeamspaceInviteLink,
} from "@/entities/teamspace/model/teamspace.mutations";
import { useTeamspaceInviteLinks } from "@/entities/teamspace/model/teamspace.queries";
import type {
	CreatedTeamspaceInviteLink,
	Teamspace,
	TeamspaceInviteLink,
	TeamspaceInviteLinkStatus,
} from "@/entities/teamspace/model/teamspace.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

import { ConfirmActionDialog } from "./confirm-action-dialog";

const DAY_MS = 24 * 60 * 60 * 1000;

// The server caps links at 30 days from its own clock; leave room for clock skew.
const EXPIRY_SKEW_MARGIN_MS = 5 * 60 * 1000;

const EXPIRY_OPTIONS = [
	{ value: "1", label: "1 day" },
	{ value: "7", label: "7 days" },
	{ value: "14", label: "14 days" },
	{ value: "30", label: "30 days" },
];

const MAX_USES_OPTIONS = [
	{ value: "unlimited", label: "No limit" },
	{ value: "1", label: "1 use" },
	{ value: "5", label: "5 uses" },
	{ value: "10", label: "10 uses" },
	{ value: "25", label: "25 uses" },
	{ value: "100", label: "100 uses" },
];

const STATUS_PRESENTATION: Record<
	TeamspaceInviteLinkStatus,
	{ label: string; className: string }
> = {
	ACTIVE: {
		label: "Active",
		className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	},
	EXPIRED: { label: "Expired", className: "bg-muted text-muted-foreground" },
	EXHAUSTED: { label: "Used up", className: "bg-muted text-muted-foreground" },
	REVOKED: { label: "Revoked", className: "bg-muted text-muted-foreground" },
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

function getShareUrl(link: CreatedTeamspaceInviteLink) {
	return link.url ?? new URL(link.relativePath, window.location.origin).toString();
}

interface TeamspaceInviteLinksTabProps {
	teamspace: Teamspace;
	canManage: boolean;
}

export function TeamspaceInviteLinksTab({
	teamspace,
	canManage,
}: TeamspaceInviteLinksTabProps) {
	const linksQuery = useTeamspaceInviteLinks(teamspace.id, canManage);

	const createMutation = useCreateTeamspaceInviteLink(teamspace.id);

	const revokeMutation = useRevokeTeamspaceInviteLink(teamspace.id);

	const [expiryDays, setExpiryDays] = useState("7");

	const [maxUses, setMaxUses] = useState("unlimited");

	const [createdLink, setCreatedLink] =
		useState<CreatedTeamspaceInviteLink | null>(null);

	const [linkToRevoke, setLinkToRevoke] = useState<TeamspaceInviteLink | null>(
		null,
	);

	if (!canManage) {
		return (
			<p className='py-6 text-center text-sm text-muted-foreground'>
				Only teamspace owners can create invite links.
			</p>
		);
	}

	// Active links first, newest first within each group.
	const links = [...(linksQuery.data ?? [])].sort(
		(a, b) =>
			Number(b.status === "ACTIVE") - Number(a.status === "ACTIVE") ||
			b.createdAt.localeCompare(a.createdAt),
	);

	const handleCreate = () => {
		createMutation.mutate(
			{
				expires_at: new Date(
					Date.now() + Number(expiryDays) * DAY_MS - EXPIRY_SKEW_MARGIN_MS,
				).toISOString(),
				max_uses: maxUses === "unlimited" ? undefined : Number(maxUses),
			},
			{
				onSuccess: setCreatedLink,
				onError: (error) =>
					toast.error(
						getApiErrorMessage(error, "Could not create the invite link."),
					),
			},
		);
	};

	const handleCopy = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied");
		} catch {
			toast.error("Could not copy. Select the link and copy it manually.");
		}
	};

	const handleRevoke = () => {
		if (!linkToRevoke) return;

		revokeMutation.mutate(linkToRevoke.id, {
			onSuccess: () => {
				toast.success("Invite link revoked");

				if (createdLink?.id === linkToRevoke.id) setCreatedLink(null);
			},
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Could not revoke the invite link."),
				),
			onSettled: () => setLinkToRevoke(null),
		});
	};

	return (
		<div className='flex flex-col gap-6'>
			<section className='flex flex-col gap-3 rounded-lg border p-4'>
				<div>
					<h3 className='text-sm font-medium'>Create an invite link</h3>

					<p className='mt-0.5 text-xs text-muted-foreground'>
						Anyone in this workspace with the link can join the
						teamspace.
					</p>
				</div>

				<div className='flex flex-col gap-2 sm:flex-row'>
					<Select value={expiryDays} onValueChange={setExpiryDays}>
						<SelectTrigger
							className='h-9 sm:w-36'
							aria-label='Link expires after'
						>
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							{EXPIRY_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									Expires in {option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={maxUses} onValueChange={setMaxUses}>
						<SelectTrigger className='h-9 sm:w-32' aria-label='Maximum uses'>
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							{MAX_USES_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						className='h-9 sm:ml-auto'
						disabled={createMutation.isPending}
						onClick={handleCreate}
					>
						<Link2 className='size-4' />
						{createMutation.isPending ? "Creating..." : "Create link"}
					</Button>
				</div>

				{createdLink && (
					<div className='flex flex-col gap-2 rounded-md bg-muted/60 p-3'>
						<div className='flex gap-2'>
							<Input
								readOnly
								value={getShareUrl(createdLink)}
								aria-label='New invite link'
								className='h-9 bg-background font-mono text-xs'
								onFocus={(event) => event.currentTarget.select()}
							/>

							<Button
								variant='outline'
								className='h-9 shrink-0'
								onClick={() => handleCopy(getShareUrl(createdLink))}
							>
								<Copy className='size-4' />
								Copy
							</Button>
						</div>

						<p className='text-xs text-muted-foreground'>
							Copy it now. For security, the link is shown only once.
						</p>
					</div>
				)}
			</section>

			<section className='flex flex-col gap-1'>
				<h3 className='text-xs font-medium text-muted-foreground'>
					Links · {links.length}
				</h3>

				{linksQuery.isLoading ? (
					<div className='flex flex-col gap-2 py-2' aria-busy='true'>
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-10 w-full' />
					</div>
				) : links.length === 0 ? (
					<p className='py-4 text-sm text-muted-foreground'>
						No invite links yet.
					</p>
				) : (
					<ul className='divide-y'>
						{links.map((link) => {
							const status = STATUS_PRESENTATION[link.status];

							return (
								<li key={link.id} className='flex items-center gap-3 py-2.5'>
									<span
										className={cn(
											"shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
											status.className,
										)}
									>
										{status.label}
									</span>

									<div className='min-w-0 flex-1 text-xs text-muted-foreground'>
										<p className='truncate'>
											{link.status === "ACTIVE"
												? `Expires ${dateFormatter.format(new Date(link.expiresAt))}`
												: `Created ${dateFormatter.format(new Date(link.createdAt))}`}
										</p>

										<p className='truncate'>
											Used {link.useCount}
											{link.maxUses ? ` of ${link.maxUses}` : ""} time
											{link.useCount === 1 && !link.maxUses ? "" : "s"}
										</p>
									</div>

									{link.status === "ACTIVE" && (
										<Button
											variant='ghost'
											size='sm'
											className='h-8 shrink-0 text-xs text-destructive hover:text-destructive'
											onClick={() => setLinkToRevoke(link)}
										>
											Revoke
										</Button>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</section>

			<ConfirmActionDialog
				open={linkToRevoke !== null}
				title='Revoke invite link?'
				description='People who have the link will no longer be able to join with it.'
				confirmLabel='Revoke link'
				pendingLabel='Revoking...'
				isPending={revokeMutation.isPending}
				onOpenChange={(open) => !open && setLinkToRevoke(null)}
				onConfirm={handleRevoke}
			/>
		</div>
	);
}
