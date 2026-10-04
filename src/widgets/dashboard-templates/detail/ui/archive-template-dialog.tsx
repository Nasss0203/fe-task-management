"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useArchiveTemplate } from "@/entities/template";
import type { PageTemplate } from "@/entities/template";
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

interface ArchiveTemplateDialogProps {
	template: PageTemplate;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onArchived?: (template: PageTemplate) => void;
}

export function ArchiveTemplateDialog({
	template,
	open,
	onOpenChange,
	onArchived,
}: ArchiveTemplateDialogProps) {
	const archiveMutation = useArchiveTemplate();
	const isPending = archiveMutation.isPending;

	const handleArchive = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			const updated = await archiveMutation.mutateAsync({
				templateId: template.id,
			});

			toast.success("Template archived.");
			onOpenChange(false);
			onArchived?.(updated);
		} catch (error: unknown) {
			let message = "Unable to archive template. Please try again.";
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const data = error.response?.data as { message?: string | string[] } | undefined;
				if (status === 403) {
					message = "You don't have permission to archive this template.";
				} else if (data?.message) {
					message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
				}
			}
			toast.error(message);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Archive template?</AlertDialogTitle>
					<AlertDialogDescription>
						This template will no longer appear in active template lists. You can restore it later if needed.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleArchive}
						disabled={isPending}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						{isPending ? (
							<>
								<Loader2 className='mr-1.5 size-3.5 animate-spin' />
								Archiving...
							</>
						) : (
							"Archive"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
