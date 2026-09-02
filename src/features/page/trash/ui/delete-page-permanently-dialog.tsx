"use client";

import type { Page } from "@/entities/page/model/page.types";

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
	page: Page | null;

	open: boolean;

	onOpenChange: (open: boolean) => void;

	onConfirm: () => void;

	isPending?: boolean;
}

export function DeletePagePermanentlyDialog({
	page,
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
						Delete page permanently?
					</AlertDialogTitle>

					<AlertDialogDescription>
						&quot;
						{page?.title || "Untitled"}
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
