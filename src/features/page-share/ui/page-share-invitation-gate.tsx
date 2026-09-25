"use client";

import {
	useAcceptPageShareInvitation,
	useRejectPageShareInvitation,
} from "@/entities/page-share/model/page-share.mutations";
import type {
	PageShareAccessLevel,
	ResolvedPageShareInvitation,
} from "@/entities/page-share/model/page-share.types";
import { Button } from "@/shared/ui/button";

const accessLabels: Record<PageShareAccessLevel, string> = {
	VIEWER: "Viewer",
	COMMENTER: "Commenter",
	EDITOR: "Editor",
	FULL_ACCESS: "Full access",
};

interface PageShareInvitationGateProps {
	token: string;
	invitation: ResolvedPageShareInvitation;
	isCheckingAccess: boolean;
	onCheckAccess: () => void;
}

export function PageShareInvitationGate({
	token,
	invitation,
	isCheckingAccess,
	onCheckAccess,
}: PageShareInvitationGateProps) {
	const acceptInvitation = useAcceptPageShareInvitation(token);
	const rejectInvitation = useRejectPageShareInvitation(token);
	const isBusy = acceptInvitation.isPending || rejectInvitation.isPending;
	const isAccepted =
		invitation.status === "ACCEPTED" || acceptInvitation.isSuccess;
	const isRejected =
		invitation.status === "REJECTED" || rejectInvitation.isSuccess;
	const isPending = invitation.status === "PENDING" && !isAccepted && !isRejected;

	const handleAccept = () => {
		if (!isPending || isBusy) return;
		rejectInvitation.reset();
		acceptInvitation.mutate();
	};

	const handleReject = () => {
		if (!isPending || isBusy) return;
		acceptInvitation.reset();
		rejectInvitation.mutate();
	};

	return (
		<div className='flex min-h-screen items-center justify-center p-6'>
			<div className='w-full max-w-md space-y-4 rounded-xl border p-6 text-center'>
				<h1 className='text-xl font-semibold'>
					{isRejected
						? "Invitation declined"
						: isAccepted
							? "Invitation accepted"
							: "You have been invited to this page"}
				</h1>

				{isRejected ? (
					<p role='status' className='text-sm text-muted-foreground'>
						You declined this invitation.
					</p>
				) : isAccepted ? (
					<>
						<p role='status' className='text-sm text-muted-foreground'>
							{isCheckingAccess || isBusy
								? "Checking page access..."
								: "Page access is not available yet. Please check again."}
						</p>
						<Button
							type='button'
							disabled={isCheckingAccess || isBusy}
							onClick={onCheckAccess}
						>
							Check access
						</Button>
					</>
				) : (
					<>
						<p className='text-sm text-muted-foreground'>
							Access: {accessLabels[invitation.accessLevel]}
						</p>
						{acceptInvitation.isError && (
							<p role='alert' className='text-sm text-destructive'>
								Unable to accept invitation. Please try again.
							</p>
						)}
						{rejectInvitation.isError && (
							<p role='alert' className='text-sm text-destructive'>
								Unable to reject invitation. Please try again.
							</p>
						)}
						<div className='flex justify-center gap-2'>
							<Button
								type='button'
								disabled={isBusy}
								onClick={handleAccept}
							>
								{acceptInvitation.isPending ? "Accepting..." : "Accept"}
							</Button>
							<Button
								type='button'
								variant='outline'
								disabled={isBusy}
								onClick={handleReject}
							>
								{rejectInvitation.isPending ? "Rejecting..." : "Reject"}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
