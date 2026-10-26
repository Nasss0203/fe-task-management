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
import { Button } from "@/shared/ui/button";

interface DeletePagePermanentlyDialogProps {
	item: { kind: "page" | "database"; title: string } | null;

	open: boolean;

	onOpenChange: (open: boolean) => void;

	onConfirm: () => void;

	isPending?: boolean;
}

export function DeletePagePermanentlyDialog({
	item,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
}: DeletePagePermanentlyDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Delete {item?.kind ?? "page"} permanently?
					</AlertDialogTitle>

					<AlertDialogDescription>
						&quot;
						{item?.title || "Untitled"}
						&quot; will be permanently deleted. This action cannot
						be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction disabled={isPending} asChild>
						<Button variant='destructive' onClick={onConfirm}>
							{isPending ? "Deleting..." : "Delete permanently"}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
