"use client";

import React, { useState } from "react";
import { Globe, Loader2, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useUpdateTemplate } from "@/entities/template";
import type { PageTemplate, TemplateVisibility } from "@/entities/template";
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

interface EditTemplateDialogProps {
	template: PageTemplate;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated?: (template: PageTemplate) => void;
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
		description: "Only you and workspace owners can view this template.",
		icon: Lock,
	},
	{
		value: "WORKSPACE",
		label: "Workspace",
		description: "All members of this workspace can view and use it.",
		icon: Users,
	},
	{
		value: "PUBLIC",
		label: "Public",
		description: "Can be discovered and used globally after publishing.",
		icon: Globe,
	},
];

export function EditTemplateDialog({
	template,
	open,
	onOpenChange,
	onUpdated,
}: EditTemplateDialogProps) {
	const updateMutation = useUpdateTemplate();

	const [name, setName] = useState(template.name || "");
	const [description, setDescription] = useState(template.description || "");
	const [visibility, setVisibility] = useState<TemplateVisibility>(template.visibility || "WORKSPACE");
	const [nameError, setNameError] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [prevOpen, setPrevOpen] = useState(open);
	if (open !== prevOpen) {
		setPrevOpen(open);
		if (open) {
			setName(template.name || "");
			setDescription(template.description || "");
			setVisibility(template.visibility || "WORKSPACE");
			setNameError(null);
			setErrorMessage(null);
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setNameError("Template name is required.");
			return;
		}

		setNameError(null);
		setErrorMessage(null);

		try {
			const updated = await updateMutation.mutateAsync({
				templateId: template.id,
				payload: {
					name: trimmedName,
					description: description.trim() || null,
					visibility,
				},
			});

			toast.success("Template updated.");
			onOpenChange(false);
			onUpdated?.(updated);
		} catch (error: unknown) {
			let message = "Unable to update template. Please try again.";
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const data = error.response?.data as { message?: string | string[] } | undefined;
				if (status === 403) {
					message = "You don't have permission to edit this template.";
				} else if (data?.message) {
					message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
				}
			}
			setErrorMessage(message);
			toast.error(message);
		}
	};

	const isPending = updateMutation.isPending;

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
						<DialogTitle className='text-base font-semibold'>
							Edit details
						</DialogTitle>
						<DialogDescription className='text-xs text-muted-foreground'>
							Update template metadata and sharing settings.
						</DialogDescription>
					</DialogHeader>

					<div className='px-6 py-5 space-y-4 max-h-[calc(85vh-160px)] overflow-y-auto'>
						{errorMessage && (
							<div
								role='alert'
								className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'
							>
								{errorMessage}
							</div>
						)}

						{/* Name */}
						<div className='space-y-1.5'>
							<Label htmlFor='edit-template-name' className='text-xs font-medium'>
								Template Name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='edit-template-name'
								value={name}
								disabled={isPending}
								placeholder='e.g. Team Wiki'
								aria-invalid={Boolean(nameError)}
								aria-describedby={nameError ? "edit-template-name-error" : undefined}
								onChange={(e) => {
									setName(e.target.value);
									if (nameError) setNameError(null);
								}}
								className='h-9 text-sm'
							/>
							{nameError && (
								<p id='edit-template-name-error' className='text-xs text-destructive'>
									{nameError}
								</p>
							)}
						</div>

						{/* Description */}
						<div className='space-y-1.5'>
							<Label
								htmlFor='edit-template-description'
								className='text-xs font-medium'
							>
								Description
							</Label>
							<textarea
								id='edit-template-description'
								value={description}
								disabled={isPending}
								rows={3}
								placeholder='Describe the purpose of this template...'
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
												name='edit-template-visibility'
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
								"Save changes"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
