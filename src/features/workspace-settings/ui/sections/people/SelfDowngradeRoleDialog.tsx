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

interface SelfDowngradeRoleDialogProps {
	open: boolean;
	isSubmitting: boolean;
	errorMessage?: string;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function SelfDowngradeRoleDialog({
	open,
	isSubmitting,
	errorMessage,
	onOpenChange,
	onConfirm,
}: SelfDowngradeRoleDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Downgrade your workspace role?</AlertDialogTitle>
					<AlertDialogDescription>
						You will lose owner permissions in this workspace. You may no
						longer be able to manage members, workspace settings, or other
						owner-only actions.
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
						{isSubmitting ? "Downgrading..." : "Downgrade to member"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
