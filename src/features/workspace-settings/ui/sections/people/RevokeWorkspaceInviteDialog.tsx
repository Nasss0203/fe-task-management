import type { PendingWorkspaceInvite } from "@/entities/workspace-invite/model/workspace-invite.types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/ui/alert-dialog";

interface RevokeWorkspaceInviteDialogProps {
	invite: PendingWorkspaceInvite | null;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function RevokeWorkspaceInviteDialog({ invite, onOpenChange, onConfirm }: RevokeWorkspaceInviteDialogProps) {
	return (
		<AlertDialog open={invite !== null} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
					<AlertDialogDescription>The pending invitation for {invite?.email ?? "this email"} will be revoked. They will no longer be able to join using it.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant='destructive' onClick={onConfirm}>Revoke invitation</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
