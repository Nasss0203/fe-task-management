import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface RemoveWorkspaceMemberDialogProps {
	open: boolean;
	person: WorkspacePerson | null;
	isSubmitting: boolean;
	errorMessage?: string;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function RemoveWorkspaceMemberDialog({
	open,
	person,
	isSubmitting,
	errorMessage,
	onOpenChange,
	onConfirm,
}: RemoveWorkspaceMemberDialogProps) {
	const displayName = person
		? person.full_name.trim() || person.email
		: "This person";

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove from workspace?</AlertDialogTitle>
					<AlertDialogDescription>
						{displayName} will lose access to this workspace and its content.
					</AlertDialogDescription>
					{errorMessage ? (
						<p role='alert' className='text-sm text-destructive'>
							{errorMessage}
						</p>
					) : null}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant='destructive'
						disabled={isSubmitting}
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{isSubmitting ? "Removing..." : "Remove member"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
