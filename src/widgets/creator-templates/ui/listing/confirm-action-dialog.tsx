"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

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
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	children?: ReactNode;
	confirmLabel: string;
	pending: boolean;
	destructive?: boolean;
	onConfirm: () => Promise<void>;
}

export function ConfirmActionDialog({
	open,
	onOpenChange,
	title,
	description,
	children,
	confirmLabel,
	pending,
	destructive,
	onConfirm,
}: ConfirmActionDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{children}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						disabled={pending}
						className={
							destructive
								? "bg-destructive text-white hover:bg-destructive/90"
								: undefined
						}
						onClick={async (event) => {
							// Keep the dialog open until the request settles.
							event.preventDefault();
							await onConfirm();
						}}
					>
						{pending && <Loader2 className='size-3.5 animate-spin' />}
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
