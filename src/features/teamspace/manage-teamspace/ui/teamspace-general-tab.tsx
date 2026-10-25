"use client";

import { Archive, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	useArchiveTeamspace,
	useUpdateTeamspace,
} from "@/entities/teamspace/model/teamspace.mutations";
import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { ConfirmActionDialog } from "./confirm-action-dialog";

const DEFAULT_ICON = "🏠";
const DESCRIPTION_MAX_LENGTH = 1000;
const ICON_CHOICES = [
	"🏠", "🚀", "💼", "📁", "📚", "🧠", "💡", "🎯",
	"🛠️", "⚙️", "📈", "📊", "🧪", "🎨", "🎧", "📣",
	"🤝", "👥", "🌍", "🏆", "🔒", "⭐", "🔥", "🌱",
];

interface TeamspaceGeneralTabProps {
	teamspace: Teamspace;
	canManage: boolean;
	onArchived: () => void;
}

export function TeamspaceGeneralTab({
	teamspace,
	canManage,
	onArchived,
}: TeamspaceGeneralTabProps) {
	const updateMutation = useUpdateTeamspace(teamspace.id);
	const archiveMutation = useArchiveTeamspace();
	const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);

	const handleArchive = () => {
		archiveMutation.mutate(teamspace.id, {
			onSuccess: () => {
				toast.success(`${teamspace.name} archived`);
				setConfirmArchiveOpen(false);
				onArchived();
			},
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Could not archive the teamspace."),
				),
		});
	};

	const [name, setName] = useState(teamspace.name);
	const [icon, setIcon] = useState(teamspace.icon ?? "");
	const [description, setDescription] = useState(teamspace.description ?? "");
	const [iconPickerOpen, setIconPickerOpen] = useState(false);

	const trimmedName = name.trim();
	const trimmedIcon = icon.trim();
	const trimmedDescription = description.trim();

	const isDirty =
		trimmedName !== teamspace.name ||
		trimmedIcon !== (teamspace.icon ?? "") ||
		trimmedDescription !== (teamspace.description ?? "");

	const nameInvalid = trimmedName.length === 0;

	const canSave =
		canManage && isDirty && !nameInvalid && !updateMutation.isPending;

	const handleDiscard = () => {
		setName(teamspace.name);
		setIcon(teamspace.icon ?? "");
		setDescription(teamspace.description ?? "");
	};

	const handlePickIcon = (value: string) => {
		setIcon(value);
		setIconPickerOpen(false);
	};

	const handleSave = () => {
		if (!canSave) return;

		updateMutation.mutate(
			{
				name: trimmedName,
				icon: trimmedIcon || null,
				description: trimmedDescription || null,
			},
			{
				onSuccess: () => toast.success("Teamspace updated"),
				onError: (error) =>
					toast.error(
						getApiErrorMessage(
							error,
							"Could not update the teamspace.",
						),
					),
			},
		);
	};

	return (
		<div className='flex flex-col gap-6'>
			<form
				className='flex flex-col gap-6'
				onSubmit={(event) => {
					event.preventDefault();
					handleSave();
				}}
			>
				<section className='flex items-start gap-4'>
					<Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
						<PopoverTrigger asChild disabled={!canManage}>
							<button
								type='button'
								aria-label='Change icon'
								className={cn(
									"flex size-16 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-3xl transition-colors",
									"enabled:hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
									"disabled:cursor-default",
								)}
							>
								<span aria-hidden='true'>
									{trimmedIcon || DEFAULT_ICON}
								</span>
							</button>
						</PopoverTrigger>

						<PopoverContent align='start' className='w-72 p-3'>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-xs font-medium text-muted-foreground'>
									Pick an icon
								</span>
								{trimmedIcon && (
									<Button
										type='button'
										variant='ghost'
										size='xs'
										onClick={() => handlePickIcon("")}
									>
										Remove
									</Button>
								)}
							</div>

							<div className='grid grid-cols-8 gap-1'>
								{ICON_CHOICES.map((choice) => (
									<button
										key={choice}
										type='button'
										onClick={() => handlePickIcon(choice)}
										className={cn(
											"flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted",
											trimmedIcon === choice &&
												"bg-muted ring-1 ring-foreground/20",
										)}
									>
										{choice}
									</button>
								))}
							</div>

							<Input
								value={icon}
								onChange={(event) => setIcon(event.target.value)}
								maxLength={8}
								placeholder='Or type any emoji'
								className='mt-3 h-8'
							/>
						</PopoverContent>
					</Popover>

					<div className='flex min-w-0 flex-1 flex-col gap-1.5'>
						<Label
							htmlFor='teamspace-name'
							className='text-xs text-muted-foreground'
						>
							Teamspace name
						</Label>
						<Input
							id='teamspace-name'
							value={name}
							onChange={(event) => setName(event.target.value)}
							maxLength={150}
							disabled={!canManage}
							aria-invalid={nameInvalid}
							className='h-10 text-base font-medium md:text-base'
						/>
						{nameInvalid && (
							<p className='text-xs text-destructive'>
								Name cannot be empty.
							</p>
						)}
					</div>
				</section>

				<section className='flex flex-col gap-1.5'>
					<div className='flex items-baseline justify-between'>
						<Label
							htmlFor='teamspace-description'
							className='text-xs text-muted-foreground'
						>
							Description
						</Label>
						<span className='text-[11px] tabular-nums text-muted-foreground'>
							{description.length}/{DESCRIPTION_MAX_LENGTH}
						</span>
					</div>
					<textarea
						id='teamspace-description'
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						maxLength={DESCRIPTION_MAX_LENGTH}
						rows={4}
						disabled={!canManage}
						placeholder='What is this teamspace for? Who should join?'
						className={cn(
							"w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground dark:bg-input/30",
							"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
							"disabled:cursor-not-allowed disabled:opacity-50",
						)}
					/>
				</section>

				{canManage ? (
					<div
						className={cn(
							"flex items-center justify-between gap-3 border-t pt-4 transition-opacity",
							!isDirty && "pointer-events-none opacity-0",
						)}
						aria-hidden={!isDirty}
					>
						<span className='text-xs text-muted-foreground'>
							You have unsaved changes
						</span>
						<div className='flex gap-2'>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={handleDiscard}
								disabled={updateMutation.isPending}
							>
								Discard
							</Button>
							<Button type='submit' size='sm' disabled={!canSave}>
								{updateMutation.isPending ? "Saving..." : "Save changes"}
							</Button>
						</div>
					</div>
				) : (
					<div className='flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground'>
						<Lock className='size-3.5 shrink-0' />
						Only teamspace owners can edit these details.
					</div>
				)}
			</form>

			{canManage && (
				<section className='flex items-center justify-between gap-4 rounded-lg border border-destructive/30 px-4 py-3'>
					<div className='min-w-0'>
						<p className='text-sm font-medium'>Archive teamspace</p>
						<p className='text-xs text-muted-foreground'>
							Hides it and its pages from everyone. Owners can restore it
							from Browse teamspaces.
						</p>
					</div>
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='shrink-0 text-destructive hover:text-destructive'
						onClick={() => setConfirmArchiveOpen(true)}
					>
						<Archive className='size-3.5' />
						Archive
					</Button>
				</section>
			)}

			<ConfirmActionDialog
				open={confirmArchiveOpen}
				title='Archive teamspace?'
				description={`${teamspace.name} and its pages will be hidden from the sidebar and search. Nothing is deleted, and an owner can restore it later.`}
				confirmLabel='Archive'
				pendingLabel='Archiving...'
				isPending={archiveMutation.isPending}
				onOpenChange={setConfirmArchiveOpen}
				onConfirm={handleArchive}
			/>
		</div>
	);
}
