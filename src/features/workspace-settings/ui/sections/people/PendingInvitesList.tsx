import type { PendingWorkspaceInvite } from "@/entities/workspace-invite/model/workspace-invite.types";
import { PendingInviteRow, type PendingInviteAction } from "./PendingInviteRow";
import { RowsSkeleton } from "./RowsSkeleton";

interface PendingInvitesListProps {
	invites: PendingWorkspaceInvite[];
	isLoading: boolean;
	isError: boolean;
	pendingActions: Record<string, PendingInviteAction | undefined>;
	actionErrors: Record<string, string | undefined>;
	onResend: (inviteId: string) => void;
	onRequestRevoke: (invite: PendingWorkspaceInvite) => void;
}

export function PendingInvitesList({ invites, isLoading, isError, pendingActions, actionErrors, onResend, onRequestRevoke }: PendingInvitesListProps) {
	if (isLoading) return <RowsSkeleton />;
	if (isError) return <p role='alert' className='py-8 text-sm text-destructive'>Unable to load pending invitations.</p>;
	if (invites.length === 0) return <p className='py-8 text-sm text-muted-foreground'>No pending invitations.</p>;

	return <div className='divide-y'>{invites.map((invite) => <PendingInviteRow key={invite.id} invite={invite} pendingAction={pendingActions[invite.id]} errorMessage={actionErrors[invite.id]} onResend={onResend} onRequestRevoke={onRequestRevoke} />)}</div>;
}
