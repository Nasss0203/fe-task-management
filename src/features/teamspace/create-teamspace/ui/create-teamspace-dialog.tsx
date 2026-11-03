"use client";

import { Lock, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";

import type { TeamspaceVisibility } from "@/entities/teamspace/model/teamspace.types";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

const VISIBILITY_OPTIONS: Array<{
	value: TeamspaceVisibility;
	label: string;
	description: string;
	icon: LucideIcon;
}> = [
	{
		value: "OPEN",
		label: "Open",
		description: "Workspace members can discover this teamspace.",
		icon: Users,
	},
	{
		value: "PRIVATE",
		label: "Private",
		description: "Only Teamspace members can access this teamspace.",
		icon: Lock,
	},
];

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
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				aria-describedby={undefined}
				className='gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0_24px_56px_-12px_rgba(0,0,0,0.28)] sm:max-w-[480px]'
			>
				<DialogHeader className='px-6 pb-2 pr-12 pt-5'>
					<DialogTitle className='text-base leading-6'>
						Create teamspace
					</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col gap-4 px-6 pb-5 pt-3'>
					<div className='flex items-center gap-3'>
						<button
							type='button'
							className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl transition-colors hover:bg-sidebar-accent'
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
							className='block w-full border-0 bg-transparent p-0 text-lg font-semibold leading-[27px] outline-none placeholder:text-muted-foreground/40'
						/>
					</div>

					<textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder='Add a description...'
						rows={2}
						className='w-full resize-none border-0 bg-transparent p-0 text-[13.5px] leading-5 outline-none placeholder:text-faint'
					/>

					<div className='flex flex-col gap-2'>
						<div className='text-[13px] font-medium leading-5'>Visibility</div>

						{VISIBILITY_OPTIONS.map((option) => {
							const Icon = option.icon;

							const selected = visibility === option.value;

							return (
								<button
									key={option.value}
									type='button'
									onClick={() => setVisibility(option.value)}
									className={cn(
										"flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
										selected
											? "border-[1.5px] border-ring bg-accent-soft"
											: "border border-border hover:bg-muted/50",
									)}
								>
									<span
										aria-hidden='true'
										className={cn(
											"mt-0.5 size-4 shrink-0 rounded-full",
											selected
												? "border-[5px] border-ring"
												: "border-[1.5px] border-muted-foreground/40",
										)}
									/>

									<div className='min-w-0 flex-1'>
										<div className='flex items-center gap-1.5 text-[13.5px] font-medium leading-5'>
											<Icon className='size-3.5 shrink-0' />
											{option.label}
										</div>

										<div className='mt-0.5 text-[12.5px] leading-[19px] text-muted-foreground'>
											{option.description}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				<div className='flex justify-end gap-2 border-t px-6 py-3'>
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
			</DialogContent>
		</Dialog>
	);
}
