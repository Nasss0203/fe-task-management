"use client";

import { Check, ChevronDown, Mail, Search, UserMinus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	useInviteTeamspaceMember,
	useRemoveTeamspaceMember,
	useResendTeamspaceInvitation,
	useRevokeTeamspaceInvitation,
	useUpdateTeamspaceMemberRole,
} from "@/entities/teamspace/model/teamspace.mutations";
import { useTeamspacePendingInvitations } from "@/entities/teamspace/model/teamspace.queries";
import type {
	Teamspace,
	TeamspaceInvitationManagement,
	TeamspaceMember,
	TeamspaceRole,
} from "@/entities/teamspace/model/teamspace.types";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Skeleton } from "@/shared/ui/skeleton";

import {
	getPersonName,
	type TeamspaceManagement,
} from "../model/use-teamspace-management";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import { PersonIdentity } from "./person-identity";

const ROLE_LABEL: Record<TeamspaceRole, string> = {
	OWNER: "Owner",
	MEMBER: "Member",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

interface TeamspaceMembersTabProps {
	teamspace: Teamspace;
	management: TeamspaceManagement;
}

export function TeamspaceMembersTab({
	teamspace,
	management,
}: TeamspaceMembersTabProps) {
	const { membersQuery, peopleQuery, peopleById, currentUserId, canManage } =
		management;

	const invitationsQuery = useTeamspacePendingInvitations(
		teamspace.id,
		canManage,
	);

	const inviteMutation = useInviteTeamspaceMember(teamspace.id);
	const roleMutation = useUpdateTeamspaceMemberRole(teamspace.id);
	const removeMutation = useRemoveTeamspaceMember(teamspace.id);
	const revokeMutation = useRevokeTeamspaceInvitation(teamspace.id);
	const resendMutation = useResendTeamspaceInvitation(teamspace.id);

	const [memberToRemove, setMemberToRemove] = useState<TeamspaceMember | null>(
		null,
	);

	const [invitationToRevoke, setInvitationToRevoke] =
		useState<TeamspaceInvitationManagement | null>(null);

	const members = [...(membersQuery.data ?? [])].sort(
		(a, b) =>
			Number(b.roleName === "OWNER") - Number(a.roleName === "OWNER") ||
			getPersonName(peopleById.get(a.workspaceMemberId)).localeCompare(
				getPersonName(peopleById.get(b.workspaceMemberId)),
			),
	);

	const pendingInvitations = invitationsQuery.data?.items ?? [];

	const unavailableIds = new Set([
		...members.map((member) => member.workspaceMemberId),
		...pendingInvitations.map((invitation) => invitation.workspaceMemberId),
	]);

	// Guests cannot belong to teamspaces.
	const candidates = (peopleQuery.data ?? []).filter(
		(person) =>
			person.membership_type === "MEMBER" && !unavailableIds.has(person.id),
	);

	const showError = (error: unknown, fallback: string) => {
		toast.error(getApiErrorMessage(error, fallback));
	};

	const handleInvite = (person: WorkspacePerson) => {
		inviteMutation.mutate(person.id, {
			onSuccess: () =>
				toast.success(`Invitation sent to ${getPersonName(person)}`),
			onError: (error) => showError(error, "Could not send the invitation."),
		});
	};

	const handleRoleChange = (member: TeamspaceMember, roleName: TeamspaceRole) => {
		roleMutation.mutate(
			{ memberId: member.id, roleName },
			{
				onSuccess: () => toast.success("Role updated"),
				onError: (error) => showError(error, "Could not update the role."),
			},
		);
	};

	const handleRemove = () => {
		if (!memberToRemove) return;

		removeMutation.mutate(memberToRemove.id, {
			onSuccess: () => toast.success("Member removed"),
			onError: (error) => showError(error, "Could not remove the member."),
			onSettled: () => setMemberToRemove(null),
		});
	};

	const handleRevoke = () => {
		if (!invitationToRevoke) return;

		revokeMutation.mutate(invitationToRevoke.id, {
			onSuccess: () => toast.success("Invitation revoked"),
			onError: (error) => showError(error, "Could not revoke the invitation."),
			onSettled: () => setInvitationToRevoke(null),
		});
	};

	const handleResend = (invitation: TeamspaceInvitationManagement) => {
		resendMutation.mutate(invitation.id, {
			onSuccess: () => toast.success("Invitation resent"),
			onError: (error) => showError(error, "Could not resend the invitation."),
		});
	};

	if (membersQuery.isLoading || peopleQuery.isLoading) {
		return <RowsSkeleton />;
	}

	if (membersQuery.isError) {
		return (
			<p role='alert' className='py-6 text-center text-sm text-muted-foreground'>
				Unable to load members.
			</p>
		);
	}

	return (
		<div className='flex flex-col gap-5'>
			{canManage && (
				<InvitePicker
					candidates={candidates}
					isInviting={inviteMutation.isPending}
					onInvite={handleInvite}
				/>
			)}

			<section className='flex flex-col gap-1'>
				<h3 className='text-[12.5px] font-medium leading-[19px] text-muted-foreground'>
					Members · {members.length}
				</h3>

				<ul>
					{members.map((member) => {
						const person = peopleById.get(member.workspaceMemberId);

						const isSelf =
							Boolean(currentUserId) && person?.user_id === currentUserId;

						return (
							<li key={member.id} className='flex h-12 items-center gap-3'>
								<PersonIdentity
									person={person}
									suffix={
										isSelf ? (
											<span className='ml-1.5 text-xs font-normal text-muted-foreground'>
												(you)
											</span>
										) : null
									}
								/>

								{canManage ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												className='shrink-0 gap-1 px-2 text-[12.5px] font-normal data-[state=open]:bg-accent'
												disabled={roleMutation.isPending}
												aria-label={`Role for ${getPersonName(person)}`}
											>
												{ROLE_LABEL[member.roleName]}
												<ChevronDown className='size-3 text-muted-foreground' />
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent align='end'>
											{(["OWNER", "MEMBER"] as const).map((role) => (
												<DropdownMenuItem
													key={role}
													onSelect={() => {
														if (role !== member.roleName) {
															handleRoleChange(member, role);
														}
													}}
												>
													<span className='flex-1'>{ROLE_LABEL[role]}</span>
													{member.roleName === role && (
														<Check className='size-3.5' />
													)}
												</DropdownMenuItem>
											))}

											{!isSelf && (
												<>
													<DropdownMenuSeparator />

													<DropdownMenuItem
														variant='destructive'
														onSelect={() => setMemberToRemove(member)}
													>
														<UserMinus className='size-4' />
														Remove from teamspace
													</DropdownMenuItem>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<span className='shrink-0 text-[12.5px] text-muted-foreground'>
										{ROLE_LABEL[member.roleName]}
									</span>
								)}
							</li>
						);
					})}
				</ul>
			</section>

			{canManage && pendingInvitations.length > 0 && (
				<section className='flex flex-col gap-1'>
					<h3 className='text-[12.5px] font-medium leading-[19px] text-muted-foreground'>
						Pending invitations · {pendingInvitations.length}
					</h3>

					<ul>
						{pendingInvitations.map((invitation) => (
							<li
								key={invitation.id}
								className='flex h-11 items-center gap-3'
							>
								<PersonIdentity
									person={peopleById.get(invitation.workspaceMemberId)}
									avatar={
										<span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
											<Mail className='size-3.5' />
										</span>
									}
									detail={`Expires ${dateFormatter.format(new Date(invitation.expiresAt))}`}
								/>

								<div className='flex shrink-0 gap-1'>
									<Button
										variant='ghost'
										disabled={resendMutation.isPending}
										onClick={() => handleResend(invitation)}
									>
										Resend
									</Button>

									<Button
										variant='ghost'
										className='text-destructive hover:bg-destructive/10 hover:text-destructive'
										onClick={() => setInvitationToRevoke(invitation)}
									>
										Revoke
									</Button>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}

			<ConfirmActionDialog
				open={memberToRemove !== null}
				title='Remove from teamspace?'
				description={`${getPersonName(
					memberToRemove
						? peopleById.get(memberToRemove.workspaceMemberId)
						: undefined,
				)} will lose access to this teamspace's pages.`}
				confirmLabel='Remove member'
				pendingLabel='Removing...'
				isPending={removeMutation.isPending}
				onOpenChange={(open) => !open && setMemberToRemove(null)}
				onConfirm={handleRemove}
			/>

			<ConfirmActionDialog
				open={invitationToRevoke !== null}
				title='Revoke invitation?'
				description='The invitation link in their inbox and email will stop working.'
				confirmLabel='Revoke invitation'
				pendingLabel='Revoking...'
				isPending={revokeMutation.isPending}
				onOpenChange={(open) => !open && setInvitationToRevoke(null)}
				onConfirm={handleRevoke}
			/>
		</div>
	);
}

interface InvitePickerProps {
	candidates: WorkspacePerson[];
	isInviting: boolean;
	onInvite: (person: WorkspacePerson) => void;
}

function InvitePicker({ candidates, isInviting, onInvite }: InvitePickerProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className='h-9 w-full justify-start gap-2 px-2.5 text-[13.5px] font-normal text-faint data-[state=open]:border-ring'
					disabled={candidates.length === 0 || isInviting}
				>
					<Search className='size-3.5' />
					{isInviting
						? "Sending invitation..."
						: candidates.length === 0
							? "Everyone in the workspace is already here"
							: "Invite a workspace member..."}
					<ChevronDown className='ml-auto size-[13px]' />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align='start'
				className='w-[var(--radix-popover-trigger-width)] p-0'
			>
				<Command>
					<CommandInput placeholder='Search by name or email' />

					<CommandList>
						<CommandEmpty>No people found.</CommandEmpty>

						<CommandGroup>
							{candidates.map((person) => (
								<CommandItem
									key={person.id}
									value={`${getPersonName(person)} ${person.email}`}
									onSelect={() => {
										setOpen(false);
										onInvite(person);
									}}
								>
									<PersonIdentity person={person} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function RowsSkeleton() {
	return (
		<div className='flex flex-col' aria-busy='true'>
			<span className='sr-only'>Loading members</span>

			{Array.from({ length: 3 }, (_, index) => (
				<div key={index} className='flex h-12 items-center gap-2.5'>
					<Skeleton className='size-7 rounded-full' />

					<div className='flex-1 space-y-1.5'>
						<Skeleton className='h-3.5 w-1/3' />
						<Skeleton className='h-3 w-1/2' />
					</div>
				</div>
			))}
		</div>
	);
}
