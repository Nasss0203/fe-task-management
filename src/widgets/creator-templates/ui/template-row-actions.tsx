"use client";

import { Archive, ArchiveRestore, ExternalLink, Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
	useRestoreTemplate,
	useUpdateTemplate,
	type PageTemplate,
	type TemplateVisibility,
} from "@/entities/template";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { ArchiveTemplateDialog } from "./manage/archive-template-dialog";
import { VISIBILITY } from "./template-meta";

/** Quick visibility / archive changes without opening the template. */
export function TemplateRowActions({ template }: { template: PageTemplate }) {
	const update = useUpdateTemplate();
	const restore = useRestoreTemplate();
	const [archiveOpen, setArchiveOpen] = useState(false);
	const isArchived = template.status === "ARCHIVED";
	const isBusy = update.isPending || restore.isPending;

	const changeVisibility = async (value: string) => {
		const visibility = value as TemplateVisibility;
		if (visibility === template.visibility) return;
		try {
			await update.mutateAsync({
				templateId: template.id,
				payload: { visibility },
			});
			toast.success(`"${template.name}" is now ${VISIBILITY[visibility].label}.`);
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Unable to change visibility."));
		}
	};

	const restoreTemplate = async () => {
		try {
			await restore.mutateAsync(template.id);
			toast.success("Template restored");
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Failed to restore template"));
		}
	};

	return (
		<>
			{/* Non-modal so the archive dialog opened from it keeps pointer events. */}
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='size-8'
						disabled={isBusy}
						aria-label={`Actions for ${template.name}`}
					>
						{isBusy ? (
							<Loader2 className='size-4 animate-spin' />
						) : (
							<MoreHorizontal className='size-4' />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-48'>
					<DropdownMenuItem asChild>
						<Link href={`/creator/templates/${template.id}`}>
							<ExternalLink />
							Open
						</Link>
					</DropdownMenuItem>

					{!isArchived && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuLabel className='text-xs text-muted-foreground'>
								Visibility
							</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={template.visibility}
								onValueChange={changeVisibility}
							>
								{(Object.keys(VISIBILITY) as TemplateVisibility[]).map(
									(value) => {
										const { label, icon: Icon } = VISIBILITY[value];
										return (
											<DropdownMenuRadioItem key={value} value={value}>
												<Icon />
												{label}
											</DropdownMenuRadioItem>
										);
									},
								)}
							</DropdownMenuRadioGroup>
						</>
					)}

					<DropdownMenuSeparator />
					{isArchived ? (
						<DropdownMenuItem onSelect={restoreTemplate}>
							<ArchiveRestore />
							Restore
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							variant='destructive'
							onSelect={() => setArchiveOpen(true)}
						>
							<Archive />
							Archive
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<ArchiveTemplateDialog
				template={template}
				open={archiveOpen}
				onOpenChange={setArchiveOpen}
			/>
		</>
	);
}
