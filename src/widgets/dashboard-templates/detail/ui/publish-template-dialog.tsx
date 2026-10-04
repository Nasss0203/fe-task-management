"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { usePublishTemplateVersion } from "@/entities/template";
import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";

interface PublishTemplateDialogProps {
	template: PageTemplate;
	version: TemplateVersion;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onPublished?: (version: TemplateVersion) => void;
}

export function PublishTemplateDialog({
	template,
	version,
	open,
	onOpenChange,
	onPublished,
}: PublishTemplateDialogProps) {
	const publishMutation = usePublishTemplateVersion();
	const isPending = publishMutation.isPending;

	const handlePublish = async () => {
		try {
			const updated = await publishMutation.mutateAsync({
				templateId: template.id,
				versionId: version.id,
			});

			toast.success(`Version v${version.version_number} published successfully.`);
			onOpenChange(false);
			onPublished?.(updated);
		} catch (error: unknown) {
			let message = "Unable to publish version. Please try again.";
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const data = error.response?.data as { message?: string | string[] } | undefined;
				if (status === 403) {
					message = "You don't have permission to publish this template version.";
				} else if (data?.message) {
					message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
				}
			}
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
			<DialogContent
				className='sm:max-w-[440px] p-0 overflow-hidden'
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
							<Sparkles className='size-4' />
						</div>
						<div>
							<DialogTitle className='text-base font-semibold'>
								Publish this version?
							</DialogTitle>
							<DialogDescription className='text-xs text-muted-foreground mt-0.5'>
								Make version v{version.version_number} available for use.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className='px-6 py-5 space-y-4 text-xs text-muted-foreground'>
					<p className='leading-relaxed text-foreground/80'>
						Once published, this version can be used by anyone who has access to this template.
					</p>

					<div className='rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-2'>
						<div className='flex items-center justify-between'>
							<span className='font-medium text-foreground'>Template</span>
							<span className='text-foreground/90'>{template.name}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='font-medium text-foreground'>Version</span>
							<Badge
								variant='outline'
								className='bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]'
							>
								v{version.version_number} Draft → Published
							</Badge>
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
						type='button'
						size='sm'
						disabled={isPending}
						onClick={handlePublish}
						className='bg-primary text-primary-foreground hover:bg-primary/90'
					>
						{isPending ? (
							<>
								<Loader2 className='mr-1.5 size-3.5 animate-spin' />
								Publishing...
							</>
						) : (
							"Publish"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
