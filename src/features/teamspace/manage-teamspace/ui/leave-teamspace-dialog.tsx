"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useLeaveTeamspace } from "@/entities/teamspace/model/teamspace.mutations";
import type {
	Teamspace,
	TeamspaceMember,
} from "@/entities/teamspace/model/teamspace.types";
import {
	getApiErrorCode,
	getApiErrorMessage,
} from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

import { useTeamspaceManagement } from "../model/use-teamspace-management";
import { PersonIdentity } from "./person-identity";

const OWNER_TRANSFER_REQUIRED = "TEAMSPACE_OWNER_TRANSFER_REQUIRED";

interface LeaveTeamspaceDialogProps {
	teamspace: Teamspace;
	onClose: () => void;
}

function byJoinOrder(a: TeamspaceMember, b: TeamspaceMember) {
	return a.joinedAt.localeCompare(b.joinedAt) || a.id.localeCompare(b.id);
}

export function LeaveTeamspaceDialog({
	teamspace,
	onClose,
}: LeaveTeamspaceDialogProps) {
	const { membersQuery, peopleQuery, peopleById, currentUserId } =
		useTeamspaceManagement(teamspace, true);

	const leaveMutation = useLeaveTeamspace();

	const [chosenOwnerId, setChosenOwnerId] = useState<string | null>(null);

	const members = membersQuery.data ?? [];

	const me = members.find(
		(member) =>
			peopleById.get(member.workspaceMemberId)?.user_id === currentUserId,
	);

	const others = members
		.filter((member) => member !== me)
		.sort(byJoinOrder);

	const mustChooseOwner =
		me?.roleName === "OWNER" &&
		others.length > 0 &&
		!others.some((member) => member.roleName === "OWNER");

	const isLastMember = Boolean(me) && others.length === 0;

	const newOwnerId = mustChooseOwner
		? (chosenOwnerId ?? others[0]?.id)
		: undefined;

	const isLoading = membersQuery.isLoading || peopleQuery.isLoading;

	const description = mustChooseOwner
		? `You are the last owner of ${teamspace.name}. Choose who becomes the owner before you leave.`
		: isLastMember
			? `You are the last member of ${teamspace.name}. Leaving archives it; you can restore it from Trash.`
			: `You will lose access to the pages in ${teamspace.name} unless someone invites you again.`;

	const confirmLabel = mustChooseOwner
		? "Transfer and leave"
		: isLastMember
			? "Leave and archive"
			: "Leave teamspace";

	const handleLeave = () => {
		leaveMutation.mutate(
			{ teamspaceId: teamspace.id, newOwnerMemberId: newOwnerId },
			{
				onSuccess: () => {
					toast.success(`You left ${teamspace.name}`);
					onClose();
				},
				onError: (error) => {
					if (getApiErrorCode(error) === OWNER_TRANSFER_REQUIRED) {
						toast.error("Choose a new owner before leaving this teamspace.");
						return;
					}

					toast.error(
						getApiErrorMessage(error, "Could not leave the teamspace."),
					);
					onClose();
				},
			},
		);
	};

	return (
		<AlertDialog open onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Leave teamspace?</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>

				{mustChooseOwner && (
					<div
						role='radiogroup'
						aria-label='New owner'
						className='flex max-h-60 flex-col gap-0.5 overflow-y-auto rounded-md border p-1'
					>
						{others.map((member) => {
							const selected = member.id === newOwnerId;

							return (
								<button
									key={member.id}
									type='button'
									role='radio'
									aria-checked={selected}
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent",
										selected && "bg-accent",
									)}
									onClick={() => setChosenOwnerId(member.id)}
								>
									<PersonIdentity
										person={peopleById.get(member.workspaceMemberId)}
									/>
									{selected && <Check className='size-4 shrink-0' />}
								</button>
							);
						})}
					</div>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={leaveMutation.isPending}>
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction
						variant='destructive'
						disabled={isLoading || leaveMutation.isPending}
						onClick={(event) => {
							event.preventDefault();
							handleLeave();
						}}
					>
						{leaveMutation.isPending ? "Leaving..." : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
