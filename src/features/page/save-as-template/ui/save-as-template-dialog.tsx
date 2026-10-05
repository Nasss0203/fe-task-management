"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Info, Loader2, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import type { Page } from "@/entities/page/model/page.types";
import {
	useCreateTemplateFromPage,
	type PageTemplate,
	type TemplateVisibility,
} from "@/entities/template";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export interface SaveAsTemplateDialogProps {
	page: Pick<Page, "id" | "title" | "icon">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved?: (template: PageTemplate) => void;
}

const VISIBILITY_OPTIONS: {
	value: TemplateVisibility;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{
		value: "PRIVATE",
		label: "Private",
		description: "Only you and permitted workspace managers can access it.",
		icon: Lock,
	},
	{
		value: "WORKSPACE",
		label: "Workspace",
		description: "Available to members of this workspace.",
		icon: Users,
	},
	{
		value: "PUBLIC",
		label: "Public",
		description:
			"Can be discovered and used outside this workspace after publishing.",
		icon: Globe,
	},
];

export function SaveAsTemplateDialog({
	page,
	open,
	onOpenChange,
	onSaved,
}: SaveAsTemplateDialogProps) {
	const router = useRouter();
	const createTemplateMutation = useCreateTemplateFromPage();

	const [name, setName] = useState(page.title?.trim() || "Untitled");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<TemplateVisibility>("PRIVATE");
	const [nameError, setNameError] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Sync default values whenever dialog opens
	useEffect(() => {
		if (open) {
			setName(page.title?.trim() || "Untitled");
			setDescription("");
			setVisibility("PRIVATE");
			setNameError(null);
			setErrorMessage(null);
		}
	}, [open, page.title]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const trimmedName = name.trim();
		if (!trimmedName) {
			setNameError("Template name is required.");
			return;
		}

		setNameError(null);
		setErrorMessage(null);

		try {
			const createdTemplate = await createTemplateMutation.mutateAsync({
				pageId: page.id,
				payload: {
					name: trimmedName,
					description: description.trim() || null,
					visibility,
				},
			});

			onOpenChange(false);
			onSaved?.(createdTemplate);

			toast.success("Template saved successfully.", {
				action: {
					label: "View my templates",
					onClick: () => {
						router.push("/dashboard/templates?tab=mine");
					},
				},
			});
		} catch (error: unknown) {
			let message = "Unable to save template. Please try again.";

			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const responseData = error.response?.data as
					| { message?: string | string[] }
					| undefined;

				if (status === 403) {
					message =
						"You don't have permission to save this page as a template.";
				} else if (status === 404) {
					message = "Page not found.";
				} else if (responseData?.message) {
					message = Array.isArray(responseData.message)
						? responseData.message.join(", ")
						: responseData.message;
				}
			}

			setErrorMessage(message);
			toast.error(message);
		}
	};

	const isPending = createTemplateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
			<DialogContent
				className='sm:max-w-[480px] p-0 overflow-hidden'
				onPointerDownOutside={(e) => {
					if (isPending) e.preventDefault();
				}}
				onEscapeKeyDown={(e) => {
					if (isPending) e.preventDefault();
				}}
			>
				<form onSubmit={handleSubmit}>
					<DialogHeader className='px-6 pt-6 pb-4 border-b border-border/60'>
						<DialogTitle className='text-lg font-semibold'>
							Save as template
						</DialogTitle>
						<DialogDescription className='text-xs text-muted-foreground'>
							Save this page and its supported content as a reusable template.
						</DialogDescription>
					</DialogHeader>

					<div className='px-6 py-5 space-y-5 max-h-[calc(85vh-160px)] overflow-y-auto'>
						{/* Error Banner */}
						{errorMessage && (
							<div
								role='alert'
								className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'
							>
								{errorMessage}
							</div>
						)}

						{/* Template name */}
						<div className='space-y-1.5'>
							<Label htmlFor='template-name' className='text-xs font-medium'>
								Template name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='template-name'
								value={name}
								disabled={isPending}
								placeholder='Untitled'
								aria-invalid={!!nameError}
								aria-describedby={
									nameError ? "template-name-error" : undefined
								}
								onChange={(e) => {
									setName(e.target.value);
									if (nameError) setNameError(null);
								}}
								className='h-9 text-sm'
							/>
							{nameError && (
								<p
									id='template-name-error'
									className='text-xs text-destructive'
								>
									{nameError}
								</p>
							)}
						</div>

						{/* Description */}
						<div className='space-y-1.5'>
							<Label
								htmlFor='template-description'
								className='text-xs font-medium'
							>
								Description
							</Label>
							<textarea
								id='template-description'
								value={description}
								disabled={isPending}
								rows={3}
								placeholder='Describe what this template is used for...'
								onChange={(e) => setDescription(e.target.value)}
								className='w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none'
							/>
						</div>

						{/* Visibility */}
						<div className='space-y-2'>
							<Label className='text-xs font-medium'>Visibility</Label>
							<div
								role='radiogroup'
								aria-label='Visibility'
								className='space-y-2'
							>
								{VISIBILITY_OPTIONS.map((option) => {
									const Icon = option.icon;
									const isSelected = visibility === option.value;

									return (
										<label
											key={option.value}
											className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
												isSelected
													? "border-primary bg-primary/5 ring-1 ring-primary/20"
													: "border-border hover:bg-accent/40"
											} ${isPending ? "opacity-60 pointer-events-none" : ""}`}
										>
											<input
												type='radio'
												name='template-visibility'
												value={option.value}
												checked={isSelected}
												aria-label={option.label}
												disabled={isPending}
												onChange={() => setVisibility(option.value)}
												className='mt-1 size-4 accent-primary cursor-pointer'
											/>
											<div className='flex-1 space-y-0.5 min-w-0'>
												<div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
													<Icon className='size-3.5 text-muted-foreground' />
													<span>{option.label}</span>
												</div>
												<p className='text-[11px] text-muted-foreground leading-snug'>
													{option.description}
												</p>
											</div>
										</label>
									);
								})}
							</div>
						</div>

						{/* Neutral Snapshot Note */}
						<div className='flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground'>
							<Info className='size-4 shrink-0 text-muted-foreground mt-0.5' />
							<p className='leading-relaxed'>
								Supported page content and database views will be included in
								the template.
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
							type='submit'
							size='sm'
							disabled={isPending || !name.trim()}
						>
							{isPending ? (
								<>
									<Loader2 className='mr-1.5 size-3.5 animate-spin' />
									Saving...
								</>
							) : (
								"Save template"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
