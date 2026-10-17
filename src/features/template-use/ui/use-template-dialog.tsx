"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useUseTemplate } from "@/entities/template";
import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface UseTemplateDialogProps {
	template: Pick<PageTemplate, "id" | "name">;
	version: Pick<TemplateVersion, "id">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UseTemplateDialog({
	template,
	version,
	open,
	onOpenChange,
}: UseTemplateDialogProps) {
	const router = useRouter();
	const { user } = useUser();
	const { data: workspaces = [] } = useWorkspaces();
	const useMutation = useUseTemplate();
	const isSubmittingRef = React.useRef(false);

	// Select destination workspace, defaulting to user's last active workspace or first available
	const initialWorkspaceId =
		(user?.lastActiveWorkspaceId &&
			workspaces.some((w) => w.id === user.lastActiveWorkspaceId) &&
			user.lastActiveWorkspaceId) ||
		workspaces[0]?.id ||
		"";

	const [selectedWorkspaceId, setSelectedWorkspaceId] =
		useState(initialWorkspaceId);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	React.useEffect(() => {
		if (open) {
			setErrorMessage(null);
			if (!selectedWorkspaceId && workspaces.length > 0) {
				setSelectedWorkspaceId(initialWorkspaceId);
			}
		}
	}, [open, selectedWorkspaceId, workspaces, initialWorkspaceId]);

	const selectedWorkspace = workspaces.find(
		(w) => w.id === selectedWorkspaceId,
	);
	const isPending = useMutation.isPending;

	const handleUseTemplate = async () => {
		if (isPending || isSubmittingRef.current) {
			return;
		}

		if (!selectedWorkspaceId) {
			setErrorMessage("Please select a destination workspace.");
			return;
		}

		setErrorMessage(null);
		isSubmittingRef.current = true;

		try {
			// FREE marketplace templates are claimed by the backend as part of Use.
			const result = await useMutation.mutateAsync({
				templateId: template.id,
				versionId: version.id,
				workspace_id: selectedWorkspaceId,
			});

			toast.success("Template added to workspace.");
			onOpenChange(false);

			if (result?.pageId) {
				router.push(`/page/${result.pageId}`);
			}
		} catch (error: unknown) {
			let message = "Unable to use template. Please try again.";
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const data = error.response?.data as
					| { message?: string | string[] }
					| undefined;
				if (data?.message) {
					message = Array.isArray(data.message)
						? data.message.join(", ")
						: data.message;
				} else if (status === 403) {
					message =
						"You don't have permission to create pages in this workspace.";
				}
			}
			setErrorMessage(message);
			toast.error(message);
		} finally {
			isSubmittingRef.current = false;
		}
	};

	return (
		<Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
			<DialogContent
				className='sm:max-w-[460px] p-0 overflow-hidden'
				onPointerDownOutside={(e) => {
					if (isPending) e.preventDefault();
				}}
				onEscapeKeyDown={(e) => {
					if (isPending) e.preventDefault();
				}}
			>
				<DialogHeader className='px-6 pt-6 pb-4 border-b border-border/60'>
					<div className='flex items-center gap-2'>
						<div className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
							<FileText className='size-4' />
						</div>
						<div>
							<DialogTitle className='text-base font-semibold'>
								Use template
							</DialogTitle>
							<DialogDescription className='text-xs text-muted-foreground mt-0.5'>
								Create a new page from &ldquo;{template.name}&rdquo;
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className='px-6 py-5 space-y-4'>
					{errorMessage && (
						<div
							role='alert'
							className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'
						>
							{errorMessage}
						</div>
					)}

					<div className='space-y-2'>
						<Label className='text-xs font-medium text-foreground'>
							Destination Workspace
						</Label>
						{workspaces.length === 0 ? (
							<div
								role='status'
								className='rounded-md border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground'
							>
								No workspaces available. Please create a workspace first.
							</div>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='outline'
										role='combobox'
										disabled={isPending}
										className='w-full justify-between h-9 text-xs font-normal'
									>
										<span className='truncate'>
											{selectedWorkspace?.name || "Select workspace..."}
										</span>
										<ChevronsUpDown className='ml-2 size-3.5 shrink-0 opacity-50' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='w-[410px]'>
									{workspaces.map((ws) => (
										<DropdownMenuItem
											key={ws.id}
											onClick={() => {
												setSelectedWorkspaceId(ws.id);
												setErrorMessage(null);
											}}
											className='flex items-center justify-between text-xs cursor-pointer'
										>
											<span className='truncate'>{ws.name}</span>
											{ws.id === selectedWorkspaceId && (
												<Check className='size-3.5 text-primary ml-2' />
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						<p className='text-[11px] text-muted-foreground'>
							The template content and database snapshot will be cloned into
							this workspace.
						</p>
					</div>
				</div>

				<DialogFooter className='px-6 py-3.5 border-t border-border/60 bg-muted/10 gap-2 sm:gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={isPending}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type='button'
						size='sm'
						disabled={isPending || !selectedWorkspaceId}
						onClick={handleUseTemplate}
						className='bg-primary text-primary-foreground hover:bg-primary/90'
					>
						{isPending ? (
							<>
								<Loader2 className='mr-1.5 size-3.5 animate-spin' />
								Creating page...
							</>
						) : (
							"Use template"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
