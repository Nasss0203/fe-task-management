"use client";

import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { PagePublication } from "@/entities/page-publication/model/page-publication.types";
import { useUpdatePublicationSettings } from "@/entities/page-publication/model/page-publication.mutations";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

type PublicationSettingsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pageId: string;
	publication: PagePublication | null;
	draftIncludeDescendants: boolean;
	onDraftIncludeDescendantsChange: (value: boolean) => void;
};

type SettingsSwitchProps = {
	checked: boolean;
	disabled?: boolean;
	label: string;
	onCheckedChange: (checked: boolean) => void;
};

function SettingsSwitch({ checked, disabled, label, onCheckedChange }: SettingsSwitchProps) {
	return (
		<button
			type='button'
			role='switch'
			aria-checked={checked}
			aria-label={label}
			disabled={disabled}
			className='group relative h-5 w-9 shrink-0 rounded-full bg-muted transition-colors aria-checked:bg-[#2e8de6] disabled:cursor-not-allowed disabled:opacity-60'
			onClick={() => onCheckedChange(!checked)}
		>
			<span className='absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform group-aria-checked:translate-x-4' />
		</button>
	);
}

export function PublicationSettingsDialog({
	open,
	onOpenChange,
	pageId,
	publication,
	draftIncludeDescendants,
	onDraftIncludeDescendantsChange,
}: PublicationSettingsDialogProps) {
	const updateIncludeDescendants = useUpdatePublicationSettings(pageId);
	const updateAllowUpdates = useUpdatePublicationSettings(pageId);

	const includeDescendants = publication?.include_descendants ?? draftIncludeDescendants;
	const allowUpdates = publication?.allow_updates ?? false;

	const showError = (error: unknown, fallback: string) => {
		toast.error(getFriendlyApiErrorMessage(error, fallback));
	};

	const handleIncludeDescendantsChange = async (checked: boolean) => {
		if (!publication) {
			onDraftIncludeDescendantsChange(checked);
			return;
		}

		try {
			await updateIncludeDescendants.mutateAsync({
				siteId: publication.site_id,
				payload: { include_descendants: checked },
			});
		} catch (error) {
			showError(error, "Unable to update subpage publication settings.");
		}
	};

	const handleAllowUpdatesChange = async (checked: boolean) => {
		if (!publication) return;

		try {
			await updateAllowUpdates.mutateAsync({
				siteId: publication.site_id,
				payload: { allow_updates: checked },
			});
		} catch (error) {
			showError(error, "Unable to update publication permissions.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='gap-0 border-[#3d3d3d] bg-[#252525] p-0 text-[#f1f1f1] sm:max-w-md'>
				<DialogHeader className='border-b border-[#383838] px-5 py-4'>
					<DialogTitle className='text-base'>Publication settings</DialogTitle>
					<DialogDescription className='sr-only'>
						Configure content and permission settings for this published site.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6 px-5 py-5'>
					<section className='space-y-3' aria-labelledby='publication-content-heading'>
						<h3 id='publication-content-heading' className='text-xs font-medium uppercase tracking-wide text-[#888]'>
							Content
						</h3>
						<div className='flex items-start justify-between gap-6'>
							<div className='space-y-1'>
								<p className='text-sm font-medium'>Include subpages</p>
								<p className='text-xs leading-5 text-[#999]'>
									Publish descendant pages together with this site.
								</p>
							</div>
							<div className='flex min-h-5 items-center gap-2'>
								{updateIncludeDescendants.isPending ? <LoaderCircle className='size-4 animate-spin text-[#999]' aria-label='Saving Include subpages' /> : null}
								<SettingsSwitch
									label='Include subpages'
									checked={includeDescendants}
									disabled={updateIncludeDescendants.isPending}
									onCheckedChange={(checked) => void handleIncludeDescendantsChange(checked)}
								/>
							</div>
						</div>
					</section>

					<section className='space-y-3' aria-labelledby='publication-permissions-heading'>
						<h3 id='publication-permissions-heading' className='text-xs font-medium uppercase tracking-wide text-[#888]'>
							Permissions
						</h3>
						<div className='flex items-start justify-between gap-6'>
							<div className='space-y-1'>
								<p className='text-sm font-medium'>Allow updates</p>
								<p className='text-xs leading-5 text-[#999]'>
									Allow signed-in users with permission to update content from this published site.
								</p>
							</div>
							<div className='flex min-h-5 items-center gap-2'>
								{updateAllowUpdates.isPending ? <LoaderCircle className='size-4 animate-spin text-[#999]' aria-label='Saving Allow updates' /> : null}
								<SettingsSwitch
									label='Allow updates'
									checked={allowUpdates}
									disabled={!publication || updateAllowUpdates.isPending}
									onCheckedChange={(checked) => void handleAllowUpdatesChange(checked)}
								/>
							</div>
						</div>
					</section>
				</div>

				<DialogFooter className='border-t border-[#383838] px-5 py-4'>
					<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
						Done
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
