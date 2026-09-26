import type { PendingWorkspaceInvite } from "@/entities/workspace-invite/model/workspace-invite.types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { getInitials, getRoleLabel } from "./people.utils";

export type PendingInviteAction = "resend" | "revoke";

interface PendingInviteRowProps {
	invite: PendingWorkspaceInvite;
	pendingAction?: PendingInviteAction;
	errorMessage?: string;
	onResend: (inviteId: string) => void;
	onRequestRevoke: (invite: PendingWorkspaceInvite) => void;
}

export function PendingInviteRow({ invite, pendingAction, errorMessage, onResend, onRequestRevoke }: PendingInviteRowProps) {
	const email = invite.email ?? "Email unavailable";
	const isBusy = pendingAction !== undefined;

	return (
		<div className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
			<div className='flex min-w-0 items-center gap-3'>
				<Avatar className='size-9'><AvatarFallback className='text-xs font-medium'>{getInitials(email)}</AvatarFallback></Avatar>
				<div className='min-w-0'>
					<p className='truncate text-sm font-medium'>{email}</p>
					<p className='text-xs text-muted-foreground'>{getRoleLabel(invite.roleName)}</p>
					{errorMessage ? <p role='alert' className='mt-1 text-xs text-destructive'>{errorMessage}</p> : null}
				</div>
			</div>
			<div className='flex shrink-0 items-center gap-1 sm:justify-end'>
				<Badge variant='secondary' className='mr-1'>Pending</Badge>
				<Button type='button' variant='ghost' size='xs' disabled={isBusy} onClick={() => onResend(invite.id)}>{pendingAction === "resend" ? "Resending..." : "Resend"}</Button>
				<Button type='button' variant='ghost' size='xs' className='text-destructive hover:text-destructive' disabled={isBusy} onClick={() => onRequestRevoke(invite)}>{pendingAction === "revoke" ? "Revoking..." : "Revoke"}</Button>
			</div>
		</div>
	);
}
