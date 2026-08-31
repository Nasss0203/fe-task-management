"use client";

import { Globe2, Lock } from "lucide-react";
import { useState } from "react";

import type { TeamspaceVisibility } from "@/entities/teamspace/model/teamspace.types";

import { Button } from "@/shared/ui/button";
import { EntityEditorDialog } from "@/shared/ui/entity-editor-dialog/entity-editor-dialog";

interface CreateTeamspaceDialogProps {
	open: boolean;

	onOpenChange: (open: boolean) => void;

	onCreate: (data: {
		name: string;
		description?: string;
		icon?: string;
		visibility: TeamspaceVisibility;
	}) => void;

	isLoading?: boolean;
}

export function CreateTeamspaceDialog({
	open,
	onOpenChange,
	onCreate,
	isLoading = false,
}: CreateTeamspaceDialogProps) {
	const [name, setName] = useState("");

	const [description, setDescription] = useState("");

	const [icon, setIcon] = useState("🏠");

	const [visibility, setVisibility] = useState<TeamspaceVisibility>("OPEN");

	const resetForm = () => {
		setName("");
		setDescription("");
		setIcon("🏠");
		setVisibility("OPEN");
	};

	const handleOpenChange = (value: boolean) => {
		onOpenChange(value);

		if (!value) {
			resetForm();
		}
	};

	const handleCreate = () => {
		const trimmedName = name.trim();

		if (!trimmedName) {
			return;
		}

		onCreate({
			name: trimmedName,
			description: description.trim() || undefined,
			icon,
			visibility,
		});
	};

	return (
		<EntityEditorDialog
			open={open}
			onOpenChange={handleOpenChange}
			title='Create teamspace'
			breadcrumbLabel='New teamspace'
			icon={<span className='text-sm'>{icon}</span>}
			headerActions={null}
		>
			{/* Title */}
			<div className='flex items-start gap-3'>
				<button
					type='button'
					className='
                        mt-1 flex size-10
                        shrink-0 items-center
                        justify-center rounded-lg
                        bg-muted text-xl
                        transition-colors
                        hover:bg-muted/80
                    '
				>
					{icon}
				</button>

				<input
					autoFocus
					value={name}
					onChange={(event) => setName(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && !isLoading) {
							handleCreate();
						}
					}}
					placeholder='New teamspace'
					className='
                        block w-full
                        border-0
                        bg-transparent
                        p-0
                        text-[40px]
                        font-bold
                        leading-[1.15]
                        tracking-[-0.02em]
                        outline-none
                        placeholder:text-muted-foreground/25
                    '
				/>
			</div>

			{/* Description */}
			<textarea
				value={description}
				onChange={(event) => setDescription(event.target.value)}
				placeholder='Add a description...'
				rows={3}
				className='
                    mt-5
                    w-full
                    resize-none
                    border-0
                    bg-transparent
                    text-sm
                    leading-6
                    outline-none
                    placeholder:text-muted-foreground/50
                '
			/>

			{/* Visibility */}
			<div className='mt-10'>
				<div className='mb-3 text-sm font-medium'>Visibility</div>

				<div className='space-y-2'>
					<button
						type='button'
						onClick={() => setVisibility("OPEN")}
						className={`
                            flex w-full
                            items-start gap-3
                            rounded-lg
                            border p-3
                            text-left
                            transition-colors
                            hover:bg-muted/50

                            ${
								visibility === "OPEN"
									? "border-foreground/20 bg-muted"
									: "border-border"
							}
                        `}
					>
						<Globe2 className='mt-0.5 size-4 shrink-0' />

						<div className='min-w-0'>
							<div className='text-sm font-medium'>Open</div>

							<div className='mt-1 text-xs leading-5 text-muted-foreground'>
								Workspace members can discover this teamspace.
							</div>
						</div>
					</button>

					<button
						type='button'
						onClick={() => setVisibility("PRIVATE")}
						className={`
                            flex w-full
                            items-start gap-3
                            rounded-lg
                            border p-3
                            text-left
                            transition-colors
                            hover:bg-muted/50

                            ${
								visibility === "PRIVATE"
									? "border-foreground/20 bg-muted"
									: "border-border"
							}
                        `}
					>
						<Lock className='mt-0.5 size-4 shrink-0' />

						<div className='min-w-0'>
							<div className='text-sm font-medium'>Private</div>

							<div className='mt-1 text-xs leading-5 text-muted-foreground'>
								Only Teamspace members can access this
								teamspace.
							</div>
						</div>
					</button>
				</div>
			</div>

			{/* Actions */}
			<div className='mt-10 flex justify-end gap-2'>
				<Button
					type='button'
					variant='outline'
					disabled={isLoading}
					onClick={() => handleOpenChange(false)}
				>
					Cancel
				</Button>

				<Button
					type='button'
					disabled={!name.trim() || isLoading}
					onClick={handleCreate}
				>
					{isLoading ? "Creating..." : "Create teamspace"}
				</Button>
			</div>
		</EntityEditorDialog>
	);
}
