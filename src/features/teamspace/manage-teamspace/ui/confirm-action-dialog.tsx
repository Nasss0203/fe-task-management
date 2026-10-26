"use client";

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

interface ConfirmActionDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	pendingLabel: string;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/** Destructive confirmation used by the teamspace management actions. */
export function ConfirmActionDialog({
	open,
	title,
	description,
	confirmLabel,
	pendingLabel,
	isPending,
	onOpenChange,
	onConfirm,
}: ConfirmActionDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

					<AlertDialogAction
						variant='destructive'
						disabled={isPending}
						onClick={(event) => {
							// Keep the dialog open until the request settles.
							event.preventDefault();
							onConfirm();
						}}
					>
						{isPending ? pendingLabel : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
