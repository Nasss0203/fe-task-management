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

interface LeaveWorkspaceDialogProps {
	open: boolean;
	isLastOwner: boolean;
	isSubmitting: boolean;
	errorMessage?: string;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function LeaveWorkspaceDialog({
	open,
	isLastOwner,
	isSubmitting,
	errorMessage,
	onOpenChange,
	onConfirm,
}: LeaveWorkspaceDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isLastOwner ? "Leave and delete workspace?" : "Leave workspace?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isLastOwner
							? "You are the last owner of this workspace. Leaving will delete the workspace."
							: "You will lose access to this workspace and its content."}
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
						{isSubmitting
							? "Leaving..."
							: isLastOwner
								? "Leave and delete"
								: "Leave workspace"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
