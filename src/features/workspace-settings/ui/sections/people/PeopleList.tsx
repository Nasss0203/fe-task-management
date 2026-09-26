import type {
	WorkspaceMemberRole,
	WorkspacePerson,
} from "@/entities/workspace-member/model/workspace-member.types";
import { PersonRow } from "./PersonRow";
import { RowsSkeleton } from "./RowsSkeleton";

interface PeopleListProps {
	people: WorkspacePerson[];
	currentUserId?: string;
	isLoading: boolean;
	isError: boolean;
	emptyMessage: string;
	canUpdateRole?: boolean;
	canRemoveMember?: boolean;
	pendingRoleUpdates?: Record<string, boolean | undefined>;
	roleErrors?: Record<string, string | undefined>;
	onRoleChange?: (person: WorkspacePerson, role: WorkspaceMemberRole) => void;
	onRequestLeave?: (person: WorkspacePerson) => void;
	onRequestRemove?: (person: WorkspacePerson) => void;
}

export function PeopleList({
	people,
	currentUserId = "",
	isLoading,
	isError,
	emptyMessage,
	canUpdateRole = false,
	canRemoveMember = false,
	pendingRoleUpdates = {},
	roleErrors = {},
	onRoleChange = () => undefined,
	onRequestLeave = () => undefined,
	onRequestRemove = () => undefined,
}: PeopleListProps) {
	if (isLoading) return <RowsSkeleton />;
	if (isError) {
		return <p role='alert' className='py-8 text-sm text-destructive'>Unable to load workspace people.</p>;
	}
	if (people.length === 0) {
		return <p className='py-8 text-sm text-muted-foreground'>{emptyMessage}</p>;
	}

	return (
		<div className='divide-y'>
			{people.map((person) => (
				<PersonRow
					key={person.id}
					person={person}
					currentUserId={currentUserId}
					canUpdateRole={canUpdateRole}
					canRemoveMember={canRemoveMember}
					isRoleUpdating={Boolean(pendingRoleUpdates[person.user_id])}
					roleError={roleErrors[person.user_id]}
					onRoleChange={onRoleChange}
					onRequestLeave={onRequestLeave}
					onRequestRemove={onRequestRemove}
				/>
			))}
		</div>
	);
}
