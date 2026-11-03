"use client";

import { Lock, Users, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { useUpdateTeamspaceJoinSettings } from "@/entities/teamspace/model/teamspace.mutations";
import type {
	Teamspace,
	TeamspaceVisibility,
} from "@/entities/teamspace/model/teamspace.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";

const OPTIONS: Array<{
	value: TeamspaceVisibility;
	label: string;
	description: string;
	icon: LucideIcon;
}> = [
	{
		value: "OPEN",
		label: "Open",
		description:
			"Anyone in the workspace can find this teamspace and join it.",
		icon: Users,
	},
	{
		value: "PRIVATE",
		label: "Private",
		description: "Only people who are invited or have an invite link can join.",
		icon: Lock,
	},
];

interface TeamspaceAccessTabProps {
	teamspace: Teamspace;
	canManage: boolean;
}

export function TeamspaceAccessTab({
	teamspace,
	canManage,
}: TeamspaceAccessTabProps) {
	const updateMutation = useUpdateTeamspaceJoinSettings(teamspace.id);

	const handleSelect = (visibility: TeamspaceVisibility) => {
		if (visibility === teamspace.visibility || updateMutation.isPending) return;

		updateMutation.mutate(visibility, {
			onSuccess: () =>
				toast.success(
					visibility === "OPEN"
						? "Teamspace is now open"
						: "Teamspace is now private",
				),
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Could not update the access setting."),
				),
		});
	};

	return (
		<div className='flex flex-col gap-4'>
			<p id='teamspace-access-label' className='text-[13px] font-medium leading-5'>
				Who can join
			</p>

			<div
				role='radiogroup'
				aria-labelledby='teamspace-access-label'
				className='flex flex-col gap-4'
			>
				{OPTIONS.map((option) => {
					const Icon = option.icon;

					const selected = teamspace.visibility === option.value;

					return (
						<button
							key={option.value}
							type='button'
							role='radio'
							aria-checked={selected}
							disabled={!canManage || updateMutation.isPending}
							onClick={() => handleSelect(option.value)}
							className={cn(
								"flex w-full items-start gap-3 rounded-lg p-3.5 text-left transition-colors disabled:cursor-default",
								selected
									? "border-[1.5px] border-ring bg-accent-soft"
									: "border border-border enabled:hover:bg-muted/50",
								!canManage && !selected && "opacity-60",
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

			{!canManage && (
				<p className='text-xs text-muted-foreground'>
					Only teamspace owners can change who can join.
				</p>
			)}
		</div>
	);
}
