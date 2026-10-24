"use client";

import { Check, Globe2, Lock, type LucideIcon } from "lucide-react";
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
		icon: Globe2,
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
		<div className='flex flex-col gap-3'>
			<div role='radiogroup' aria-label='Who can join' className='space-y-2'>
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
								"flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
								"enabled:hover:bg-muted/50 disabled:cursor-default",
								selected ? "border-foreground/20 bg-muted" : "border-border",
								!canManage && !selected && "opacity-60",
							)}
						>
							<Icon className='mt-0.5 size-4 shrink-0' />

							<div className='min-w-0 flex-1'>
								<div className='text-sm font-medium'>{option.label}</div>

								<div className='mt-1 text-xs leading-5 text-muted-foreground'>
									{option.description}
								</div>
							</div>

							{selected && <Check className='mt-0.5 size-4 shrink-0' />}
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
