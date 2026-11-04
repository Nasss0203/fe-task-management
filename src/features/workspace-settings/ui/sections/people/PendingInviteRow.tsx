import type { PendingWorkspaceInvite } from "@/entities/workspace-invite/model/workspace-invite.types";
import { Mail } from "lucide-react";

import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { getRoleLabel } from "./people.utils";

export type PendingInviteAction = "resend" | "revoke";

interface PendingInviteRowProps {
	invite: PendingWorkspaceInvite;
	pendingAction?: PendingInviteAction;
	errorMessage?: string;
	onResend: (inviteId: string) => void;
	onRequestRevoke: (invite: PendingWorkspaceInvite) => void;
}

export function PendingInviteRow({
	invite,
	pendingAction,
	errorMessage,
	onResend,
	onRequestRevoke,
}: PendingInviteRowProps) {
	const email = invite.email ?? "Email unavailable";
	const isBusy = pendingAction !== undefined;

	return (
		<div className='flex min-h-14 items-center justify-between gap-3 border-b py-2'>
			<div className='flex min-w-0 items-center gap-3'>
				<Avatar className='size-8'>
					<AvatarFallback>
						<Mail className='size-3.5' />
					</AvatarFallback>
				</Avatar>
				<div className='min-w-0'>
					<p className='truncate text-[13.5px] font-medium leading-5'>{email}</p>
					<p className='truncate text-[12.5px] leading-[19px] text-muted-foreground'>
						{getRoleLabel(invite.roleName)}
					</p>
					{errorMessage ? (
						<p role='alert' className='mt-1 text-xs text-destructive'>
							{errorMessage}
						</p>
					) : null}
				</div>
			</div>
			<div className='flex shrink-0 items-center gap-1 sm:justify-end'>
				<Button
					type='button'
					variant='ghost'
					className='text-foreground'
					disabled={isBusy}
					onClick={() => onResend(invite.id)}
				>
					{pendingAction === "resend" ? "Resending..." : "Resend"}
				</Button>
				<Button
					type='button'
					variant='ghost'
					className='text-destructive hover:bg-destructive/10 hover:text-destructive'
					disabled={isBusy}
					onClick={() => onRequestRevoke(invite)}
				>
					{pendingAction === "revoke" ? "Revoking..." : "Revoke"}
				</Button>
			</div>
		</div>
	);
}
