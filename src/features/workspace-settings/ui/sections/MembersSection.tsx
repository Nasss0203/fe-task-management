"use client";

import { Search, UserPlus } from "lucide-react";
import { useState } from "react";

import {
	useResendWorkspaceInvite,
	useRevokeWorkspaceInvite,
} from "@/entities/workspace-invite/model/workspace-invite.mutations";
import { usePendingWorkspaceInvites } from "@/entities/workspace-invite/model/workspace-invite.queries";
import type { PendingWorkspaceInvite } from "@/entities/workspace-invite/model/workspace-invite.types";
import { useWorkspacePeople } from "@/entities/workspace-member/model/workspace-member.queries";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { InviteWorkspaceMembersDialog } from "@/features/workspace-invite/ui/InviteWorkspaceMembersDialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shared/ui/tabs";

interface MembersSectionProps {
	workspaceId: string;
}

type PendingInviteAction = "resend" | "revoke";

const MembersSection = ({ workspaceId }: MembersSectionProps) => {
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
	const resendMutation = useResendWorkspaceInvite();
	const revokeMutation = useRevokeWorkspaceInvite();

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
	const guests = people.filter(
		(person) => person.membership_type === "GUEST",
	);
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
			} else {
				await revokeMutation.mutateAsync({ workspaceId, inviteId });
			}
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

	const handleConfirmRevoke = () => {
		if (!inviteToRevoke) return;

		void runPendingInviteAction(inviteToRevoke.id, "revoke");
	};

	return (
		<div className='mx-auto w-full max-w-4xl px-6 py-8 sm:px-8'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='min-w-0'>
					<h2 className='text-xl font-semibold tracking-tight'>People</h2>
					<p className='mt-1 text-sm text-muted-foreground'>
						Manage people in your workspace and their roles.
					</p>
				</div>

				<Button
					type='button'
					className='self-start'
					onClick={() => setInviteDialogOpen(true)}
				>
					<UserPlus className='size-4' />
					Add members
				</Button>
			</div>

			<div className='relative mt-6 max-w-md'>
				<Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder='Search people'
					aria-label='Search workspace people'
					className='pl-9'
				/>
			</div>

			<Tabs defaultValue='members' className='mt-6 gap-0'>
				<TabsList
					variant='line'
					className='h-10 w-full justify-start rounded-none border-b p-0'
				>
					<TabsTrigger value='members' className='flex-none px-3'>
						Members ({members.length})
					</TabsTrigger>
					<TabsTrigger value='guests' className='flex-none px-3'>
						Guests ({guests.length})
					</TabsTrigger>
					<TabsTrigger value='pending' className='flex-none px-3'>
						Pending ({pendingInvites.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='members' className='pt-2'>
					<PeopleList
						people={visibleMembers}
						isLoading={isPeopleLoading}
						isError={isPeopleError}
						emptyMessage='No members found.'
					/>
				</TabsContent>

				<TabsContent value='guests' className='pt-2'>
					<PeopleList
						people={visibleGuests}
						isLoading={isPeopleLoading}
						isError={isPeopleError}
						emptyMessage='No guests yet.'
					/>
				</TabsContent>

				<TabsContent value='pending' className='pt-2'>
					<PendingInvitesList
						invites={visiblePendingInvites}
						isLoading={isPendingLoading}
						isError={isPendingError}
						pendingActions={pendingActions}
						actionErrors={actionErrors}
						onResend={(inviteId) => {
							void runPendingInviteAction(inviteId, "resend");
						}}
						onRequestRevoke={setInviteToRevoke}
					/>
				</TabsContent>
			</Tabs>

			<InviteWorkspaceMembersDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
				workspaceId={workspaceId}
			/>

			<RevokeWorkspaceInviteDialog
				invite={inviteToRevoke}
				onOpenChange={(open) => {
					if (!open) setInviteToRevoke(null);
				}}
				onConfirm={handleConfirmRevoke}
			/>
		</div>
	);
};

interface PeopleListProps {
	people: WorkspacePerson[];
	isLoading: boolean;
	isError: boolean;
	emptyMessage: string;
}

function PeopleList({
	people,
	isLoading,
	isError,
	emptyMessage,
}: PeopleListProps) {
	if (isLoading) {
		return <RowsSkeleton />;
	}

	if (isError) {
		return (
			<p role='alert' className='py-8 text-sm text-destructive'>
				Unable to load workspace people.
			</p>
		);
	}

	if (people.length === 0) {
		return (
			<p className='py-8 text-sm text-muted-foreground'>{emptyMessage}</p>
		);
	}

	return (
		<div className='divide-y'>
			{people.map((person) => (
				<PersonRow key={person.id} person={person} />
			))}
		</div>
	);
}

function PersonRow({ person }: { person: WorkspacePerson }) {
	const displayName = person.full_name.trim() || person.email;
	const roleLabel =
		person.membership_type === "GUEST"
			? "Guest"
			: getRoleLabel(person.role_name);

	return (
		<div className='flex items-center justify-between gap-4 py-4'>
			<div className='flex min-w-0 items-center gap-3'>
				<Avatar className='size-9'>
					{person.avatar_url ? (
						<AvatarImage src={person.avatar_url} alt={displayName} />
					) : null}
					<AvatarFallback className='text-xs font-medium'>
						{getInitials(displayName)}
					</AvatarFallback>
				</Avatar>

				<div className='min-w-0'>
					<p className='truncate text-sm font-medium'>{displayName}</p>
					<p className='truncate text-xs text-muted-foreground'>
						{person.email}
					</p>
				</div>
			</div>

			<span className='shrink-0 text-sm text-muted-foreground'>
				{roleLabel}
			</span>
		</div>
	);
}

interface PendingInvitesListProps {
	invites: PendingWorkspaceInvite[];
	isLoading: boolean;
	isError: boolean;
	pendingActions: Record<string, PendingInviteAction | undefined>;
	actionErrors: Record<string, string | undefined>;
	onResend: (inviteId: string) => void;
	onRequestRevoke: (invite: PendingWorkspaceInvite) => void;
}

function PendingInvitesList({
	invites,
	isLoading,
	isError,
	pendingActions,
	actionErrors,
	onResend,
	onRequestRevoke,
}: PendingInvitesListProps) {
	if (isLoading) {
		return <RowsSkeleton />;
	}

	if (isError) {
		return (
			<p role='alert' className='py-8 text-sm text-destructive'>
				Unable to load pending invitations.
			</p>
		);
	}

	if (invites.length === 0) {
		return (
			<p className='py-8 text-sm text-muted-foreground'>
				No pending invitations.
			</p>
		);
	}

	return (
		<div className='divide-y'>
			{invites.map((invite) => (
				<PendingInviteRow
					key={invite.id}
					invite={invite}
					pendingAction={pendingActions[invite.id]}
					errorMessage={actionErrors[invite.id]}
					onResend={onResend}
					onRequestRevoke={onRequestRevoke}
				/>
			))}
		</div>
	);
}

interface PendingInviteRowProps {
	invite: PendingWorkspaceInvite;
	pendingAction?: PendingInviteAction;
	errorMessage?: string;
	onResend: (inviteId: string) => void;
	onRequestRevoke: (invite: PendingWorkspaceInvite) => void;
}

function PendingInviteRow({
	invite,
	pendingAction,
	errorMessage,
	onResend,
	onRequestRevoke,
}: PendingInviteRowProps) {
	const email = invite.email ?? "Email unavailable";
	const isBusy = pendingAction !== undefined;

	return (
		<div className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
			<div className='flex min-w-0 items-center gap-3'>
				<Avatar className='size-9'>
					<AvatarFallback className='text-xs font-medium'>
						{getInitials(email)}
					</AvatarFallback>
				</Avatar>

				<div className='min-w-0'>
					<p className='truncate text-sm font-medium'>{email}</p>
					<p className='text-xs text-muted-foreground'>
						{getRoleLabel(invite.roleName)}
					</p>
					{errorMessage ? (
						<p role='alert' className='mt-1 text-xs text-destructive'>
							{errorMessage}
						</p>
					) : null}
				</div>
			</div>

			<div className='flex shrink-0 items-center gap-1 sm:justify-end'>
				<Badge variant='secondary' className='mr-1'>
					Pending
				</Badge>
				<Button
					type='button'
					variant='ghost'
					size='xs'
					disabled={isBusy}
					onClick={() => onResend(invite.id)}
				>
					{pendingAction === "resend" ? "Resending..." : "Resend"}
				</Button>
				<Button
					type='button'
					variant='ghost'
					size='xs'
					className='text-destructive hover:text-destructive'
					disabled={isBusy}
					onClick={() => onRequestRevoke(invite)}
				>
					{pendingAction === "revoke" ? "Revoking..." : "Revoke"}
				</Button>
			</div>
		</div>
	);
}

interface RevokeWorkspaceInviteDialogProps {
	invite: PendingWorkspaceInvite | null;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

function RevokeWorkspaceInviteDialog({
	invite,
	onOpenChange,
	onConfirm,
}: RevokeWorkspaceInviteDialogProps) {
	return (
		<AlertDialog open={invite !== null} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
					<AlertDialogDescription>
						The pending invitation for {invite?.email ?? "this email"} will
						 be revoked. They will no longer be able to join using it.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant='destructive' onClick={onConfirm}>
						Revoke invitation
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function RowsSkeleton() {
	return (
		<div aria-label='Loading' className='divide-y'>
			{[0, 1, 2].map((item) => (
				<div key={item} className='flex items-center gap-3 py-4'>
					<Skeleton className='size-9 rounded-full' />
					<div className='flex-1 space-y-2'>
						<Skeleton className='h-4 w-40' />
						<Skeleton className='h-3 w-56 max-w-full' />
					</div>
					<Skeleton className='h-4 w-24' />
				</div>
			))}
		</div>
	);
}

function matchesPersonSearch(person: WorkspacePerson, search: string) {
	if (!search) return true;

	return (
		person.full_name.toLowerCase().includes(search) ||
		person.email.toLowerCase().includes(search)
	);
}

function getRoleLabel(role: "OWNER" | "MEMBER" | null) {
	return role === "OWNER" ? "Workspace owner" : "Member";
}

function getInitials(value: string) {
	const parts = value.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function omitRecordKey<T>(record: Record<string, T>, key: string) {
	const nextRecord = { ...record };
	delete nextRecord[key];
	return nextRecord;
}

export default MembersSection;
