import type {
	WorkspaceMemberRole,
	WorkspacePerson,
} from "@/entities/workspace-member/model/workspace-member.types";
import { Check, ChevronDown, LogOut, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
 	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { getInitials, getRoleLabel } from "./people.utils";

interface PersonRowProps {
	person: WorkspacePerson;
	currentUserId: string;
	canUpdateRole: boolean;
	canRemoveMember: boolean;
	isRoleUpdating: boolean;
	roleError?: string;
	onRoleChange: (person: WorkspacePerson, role: WorkspaceMemberRole) => void;
	onRequestLeave: (person: WorkspacePerson) => void;
	onRequestRemove: (person: WorkspacePerson) => void;
}

export function PersonRow({
	person,
	currentUserId,
	canUpdateRole,
	canRemoveMember,
	isRoleUpdating,
	roleError,
	onRoleChange,
	onRequestLeave,
	onRequestRemove,
}: PersonRowProps) {
	const displayName = person.full_name.trim() || person.email;
	const isSelf = currentUserId === person.user_id;
	const canRemoveTarget =
		!isSelf && canRemoveMember && person.role_name !== "OWNER";
	const canOpenRoleMenu =
		(person.membership_type === "MEMBER" &&
			person.role_name !== null &&
			(canUpdateRole || isSelf || canRemoveTarget)) ||
		(person.membership_type === "GUEST" && canRemoveTarget);

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
					<p className='truncate text-xs text-muted-foreground'>{person.email}</p>
					{roleError ? (
						<p role='alert' className='mt-1 text-xs text-destructive'>
							{roleError}
						</p>
					) : null}
				</div>
			</div>

			{canOpenRoleMenu ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='outline'
							size='sm'
							disabled={isRoleUpdating}
							aria-label={`Role for ${displayName}`}
						>
							{person.membership_type === "GUEST"
								? "Guest"
								: getRoleLabel(person.role_name)}
							<ChevronDown className='size-4 opacity-50' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						{person.membership_type === "MEMBER"
							? (["OWNER", "MEMBER"] as const).map((role) => (
							<DropdownMenuItem
								key={role}
								disabled={!canUpdateRole && person.role_name !== role}
								onSelect={() => {
									if (canUpdateRole && person.role_name !== role) {
										onRoleChange(person, role);
									}
								}}
							>
								<span className='flex-1'>{getRoleLabel(role)}</span>
								{person.role_name === role ? <Check className='size-4' /> : null}
							</DropdownMenuItem>
							))
							: null}
						{isSelf ? (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant='destructive'
									onSelect={() => onRequestLeave(person)}
								>
									<LogOut className='size-4' />
									Leave workspace
								</DropdownMenuItem>
							</>
						) : null}
						{canRemoveTarget ? (
							<>
								{person.membership_type === "MEMBER" ? (
									<DropdownMenuSeparator />
								) : null}
								<DropdownMenuItem
									variant='destructive'
									onSelect={() => onRequestRemove(person)}
								>
									<UserMinus className='size-4' />
									Remove from workspace
								</DropdownMenuItem>
							</>
						) : null}
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<span className='shrink-0 text-sm text-muted-foreground'>
					{person.membership_type === "GUEST"
						? "Guest"
						: getRoleLabel(person.role_name)}
				</span>
			)}
		</div>
	);
}
