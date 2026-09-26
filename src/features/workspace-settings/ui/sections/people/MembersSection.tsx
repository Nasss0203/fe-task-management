"use client";

import { Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
	useResendWorkspaceInvite,
	useRevokeWorkspaceInvite,
} from "@/entities/workspace-invite/model/workspace-invite.mutations";
import { usePendingWorkspaceInvites } from "@/entities/workspace-invite/model/workspace-invite.queries";
import type { PendingWorkspaceInvite } from "@/entities/workspace-invite/model/workspace-invite.types";
import {
	useLeaveWorkspace,
	useRemoveWorkspaceMember,
	useUpdateWorkspaceMemberRole,
} from "@/entities/workspace-member/model/workspace-member.mutations";
import { useWorkspacePeople } from "@/entities/workspace-member/model/workspace-member.queries";
import type {
	WorkspaceMemberRole,
	WorkspacePerson,
} from "@/entities/workspace-member/model/workspace-member.types";
import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";
import type { Workspace } from "@/entities/workspace/model/workspace.types";
import { useSelectWorkspace } from "@/entities/workspace/model/workspace.mutations";
import { useUser } from "@/features/auth";
import { useSettingsDialog } from "@/features/workspace-settings/model/use-settings-dialog";
import { InviteWorkspaceMembersDialog } from "@/features/workspace-invite/ui/InviteWorkspaceMembersDialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { PendingInvitesList } from "./PendingInvitesList";
import { LeaveWorkspaceDialog } from "./LeaveWorkspaceDialog";
import type { PendingInviteAction } from "./PendingInviteRow";
import { PeopleList } from "./PeopleList";
import { RevokeWorkspaceInviteDialog } from "./RevokeWorkspaceInviteDialog";
import { RemoveWorkspaceMemberDialog } from "./RemoveWorkspaceMemberDialog";
import { SelfDowngradeRoleDialog } from "./SelfDowngradeRoleDialog";
import { matchesPersonSearch, omitRecordKey } from "./people.utils";

interface MembersSectionProps {
	workspaceId: string;
	currentUserId: string;
	canInviteMembers?: boolean;
	canUpdateMemberRole?: boolean;
	canRemoveMember?: boolean;
}

const MembersSection = ({
	workspaceId,
	currentUserId,
	canInviteMembers = false,
	canUpdateMemberRole = false,
	canRemoveMember = false,
}: MembersSectionProps) => {
	type PendingRoleChange = {
		person: WorkspacePerson;
		nextRole: WorkspaceMemberRole;
	} | null;

	const queryClient = useQueryClient();
	const router = useRouter();
	const { user, setUser } = useUser();
	const setSettingsOpen = useSettingsDialog((state) => state.setOpen);
	const [search, setSearch] = useState("");
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [inviteToRevoke, setInviteToRevoke] =
		useState<PendingWorkspaceInvite | null>(null);
	const [pendingActions, setPendingActions] = useState<
		Record<string, PendingInviteAction | undefined>
	>({});
	const [actionErrors, setActionErrors] = useState<
		Record<string, string | undefined>
	>({});
	const [pendingRoleUpdates, setPendingRoleUpdates] = useState<
		Record<string, boolean | undefined>
	>({});
	const [roleErrors, setRoleErrors] = useState<
		Record<string, string | undefined>
	>({});
	const [pendingRoleChange, setPendingRoleChange] =
		useState<PendingRoleChange>(null);
	const [personLeaving, setPersonLeaving] = useState<WorkspacePerson | null>(null);
	const [leaveError, setLeaveError] = useState<string>();
	const [personToRemove, setPersonToRemove] = useState<WorkspacePerson | null>(null);
	const [removeError, setRemoveError] = useState<string>();
	const resendMutation = useResendWorkspaceInvite();
	const revokeMutation = useRevokeWorkspaceInvite();
	const updateRoleMutation = useUpdateWorkspaceMemberRole();
	const leaveWorkspaceMutation = useLeaveWorkspace();
	const removeWorkspaceMemberMutation = useRemoveWorkspaceMember();
	const selectWorkspaceMutation = useSelectWorkspace();

	const {
		data: people = [],
		isLoading: isPeopleLoading,
		isError: isPeopleError,
	} = useWorkspacePeople(workspaceId);
	const {
		data: pendingInvites = [],
		isLoading: isPendingLoading,
		isError: isPendingError,
	} = usePendingWorkspaceInvites(workspaceId);
	const normalizedSearch = search.trim().toLowerCase();
	const members = people.filter(
		(person) => person.membership_type === "MEMBER",
	);
	const guests = people.filter((person) => person.membership_type === "GUEST");
	const ownerCount = members.filter((person) => person.role_name === "OWNER").length;
	const isLastOwner =
		personLeaving?.role_name === "OWNER" && ownerCount === 1;
	const visibleMembers = members.filter((person) =>
		matchesPersonSearch(person, normalizedSearch),
	);
	const visibleGuests = guests.filter((person) =>
		matchesPersonSearch(person, normalizedSearch),
	);
	const visiblePendingInvites = pendingInvites.filter((invite) =>
		(invite.email ?? "").toLowerCase().includes(normalizedSearch),
	);

	const runPendingInviteAction = async (
		inviteId: string,
		action: PendingInviteAction,
	) => {
		if (pendingActions[inviteId]) return;
		setPendingActions((current) => ({ ...current, [inviteId]: action }));
		setActionErrors((current) => omitRecordKey(current, inviteId));
		try {
			if (action === "resend") {
				await resendMutation.mutateAsync({ workspaceId, inviteId });
			}
			else await revokeMutation.mutateAsync({ workspaceId, inviteId });
		} catch {
			setActionErrors((current) => ({
				...current,
				[inviteId]:
					action === "resend"
						? "Unable to resend invitation."
						: "Unable to revoke invitation.",
			}));
		} finally {
			setPendingActions((current) => omitRecordKey(current, inviteId));
		}
	};

	const runRoleChange = async (
		person: WorkspacePerson,
		roleName: WorkspaceMemberRole,
	): Promise<boolean> => {
		if (
			person.membership_type !== "MEMBER" ||
			person.role_name === roleName ||
			pendingRoleUpdates[person.user_id]
		) {
			return false;
		}
		setPendingRoleUpdates((current) => ({ ...current, [person.user_id]: true }));
		setRoleErrors((current) => omitRecordKey(current, person.user_id));
		try {
			await updateRoleMutation.mutateAsync({
				workspaceId,
				userId: person.user_id,
				roleName,
			});
			return true;
		} catch {
			setRoleErrors((current) => ({
				...current,
				[person.user_id]: "Unable to change this member's role.",
			}));
			return false;
		} finally {
			setPendingRoleUpdates((current) => omitRecordKey(current, person.user_id));
		}
	};

	const handleRoleChange = (
		person: WorkspacePerson,
		nextRole: WorkspaceMemberRole,
	) => {
		const isSelfDowngrade =
			currentUserId === person.user_id &&
			person.role_name === "OWNER" &&
			nextRole === "MEMBER";

		if (isSelfDowngrade) {
			setRoleErrors((current) => omitRecordKey(current, person.user_id));
			setPendingRoleChange({ person, nextRole });
			return;
		}

		void runRoleChange(person, nextRole);
	};

	const handleConfirmSelfDowngrade = async () => {
		if (!pendingRoleChange) return;

		const succeeded = await runRoleChange(
			pendingRoleChange.person,
			pendingRoleChange.nextRole,
		);
		if (!succeeded) return;

		await queryClient.invalidateQueries({
			queryKey: workspaceKeys.access(workspaceId),
		});
		setPendingRoleChange(null);
	};

	const handleConfirmLeave = async () => {
		if (!personLeaving || leaveWorkspaceMutation.isPending) return;

		setLeaveError(undefined);
		try {
			await leaveWorkspaceMutation.mutateAsync({ workspaceId });
		} catch {
			setLeaveError("Unable to leave this workspace. Please try again.");
			return;
		}

		const remainingWorkspaces =
			queryClient.getQueryData<Workspace[]>(workspaceKeys.all) ?? [];
		const nextWorkspace = remainingWorkspaces[0];

		if (nextWorkspace) {
			try {
				await selectWorkspaceMutation.mutateAsync(nextWorkspace.id);
			} catch {
				// Leaving already succeeded. Keep the local session usable while the
				// backend-selected active workspace is picked up on the next refresh.
				if (user) setUser({ ...user, lastActiveWorkspaceId: nextWorkspace.id });
			}
		} else if (user) {
			setUser({ ...user, lastActiveWorkspaceId: null });
		}

		setPersonLeaving(null);
		setSettingsOpen(false);
		router.replace("/dashboard");
	};

	const handleConfirmRemove = async () => {
		if (!personToRemove || removeWorkspaceMemberMutation.isPending) return;

		setRemoveError(undefined);
		try {
			await removeWorkspaceMemberMutation.mutateAsync({
				workspaceId,
				userId: personToRemove.user_id,
			});
			setPersonToRemove(null);
		} catch {
			setRemoveError("Unable to remove this person from the workspace.");
		}
	};

	return (
		<div className='mx-auto w-full max-w-4xl px-6 py-8 sm:px-8'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='min-w-0'>
					<h2 className='text-xl font-semibold tracking-tight'>People</h2>
					<p className='mt-1 text-sm text-muted-foreground'>Manage people in your workspace and their roles.</p>
				</div>
				{canInviteMembers ? (
					<Button type='button' className='self-start' onClick={() => setInviteDialogOpen(true)}>
						<UserPlus className='size-4' />
						Add members
					</Button>
				) : null}
			</div>
			<div className='relative mt-6 max-w-md'>
				<Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
				<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search people' aria-label='Search workspace people' className='pl-9' />
			</div>
			<Tabs defaultValue='members' className='mt-6 gap-0'>
				<TabsList variant='line' className='h-10 w-full justify-start rounded-none border-b p-0'>
					<TabsTrigger value='members' className='flex-none px-3'>Members ({members.length})</TabsTrigger>
					<TabsTrigger value='guests' className='flex-none px-3'>Guests ({guests.length})</TabsTrigger>
					<TabsTrigger value='pending' className='flex-none px-3'>Pending ({pendingInvites.length})</TabsTrigger>
				</TabsList>
				<TabsContent value='members' className='pt-2'>
					<PeopleList people={visibleMembers} currentUserId={currentUserId} isLoading={isPeopleLoading} isError={isPeopleError} emptyMessage='No members found.' canUpdateRole={canUpdateMemberRole} canRemoveMember={canRemoveMember} pendingRoleUpdates={pendingRoleUpdates} roleErrors={roleErrors} onRoleChange={handleRoleChange} onRequestLeave={(person) => { setLeaveError(undefined); setPersonLeaving(person); }} onRequestRemove={(person) => { setRemoveError(undefined); setPersonToRemove(person); }} />
				</TabsContent>
				<TabsContent value='guests' className='pt-2'>
					<PeopleList people={visibleGuests} currentUserId={currentUserId} isLoading={isPeopleLoading} isError={isPeopleError} emptyMessage='No guests yet.' canRemoveMember={canRemoveMember} onRequestRemove={(person) => { setRemoveError(undefined); setPersonToRemove(person); }} />
				</TabsContent>
				<TabsContent value='pending' className='pt-2'>
					<PendingInvitesList invites={visiblePendingInvites} isLoading={isPendingLoading} isError={isPendingError} pendingActions={pendingActions} actionErrors={actionErrors} onResend={(inviteId) => void runPendingInviteAction(inviteId, "resend")} onRequestRevoke={setInviteToRevoke} />
				</TabsContent>
			</Tabs>
			{canInviteMembers ? <InviteWorkspaceMembersDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} workspaceId={workspaceId} /> : null}
			<RevokeWorkspaceInviteDialog invite={inviteToRevoke} onOpenChange={(open) => { if (!open) setInviteToRevoke(null); }} onConfirm={() => { if (inviteToRevoke) void runPendingInviteAction(inviteToRevoke.id, "revoke"); }} />
			<SelfDowngradeRoleDialog
				open={pendingRoleChange !== null}
				isSubmitting={Boolean(
					pendingRoleChange &&
					pendingRoleUpdates[pendingRoleChange.person.user_id],
				)}
				errorMessage={
					pendingRoleChange
						? roleErrors[pendingRoleChange.person.user_id]
						: undefined
				}
				onOpenChange={(open) => {
					if (!open) setPendingRoleChange(null);
				}}
				onConfirm={() => void handleConfirmSelfDowngrade()}
			/>
			<LeaveWorkspaceDialog
				open={personLeaving !== null}
				isLastOwner={isLastOwner}
				isSubmitting={
					leaveWorkspaceMutation.isPending || selectWorkspaceMutation.isPending
				}
				errorMessage={leaveError}
				onOpenChange={(open) => {
					if (
						!open &&
						!leaveWorkspaceMutation.isPending &&
						!selectWorkspaceMutation.isPending
					) {
						setPersonLeaving(null);
					}
				}}
				onConfirm={() => void handleConfirmLeave()}
			/>
			<RemoveWorkspaceMemberDialog
				open={personToRemove !== null}
				person={personToRemove}
				isSubmitting={removeWorkspaceMemberMutation.isPending}
				errorMessage={removeError}
				onOpenChange={(open) => {
					if (!open && !removeWorkspaceMemberMutation.isPending) {
						setPersonToRemove(null);
					}
				}}
				onConfirm={() => void handleConfirmRemove()}
			/>
		</div>
	);
};

export default MembersSection;
