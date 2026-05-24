"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@/components/ui/avatar";

type TaskAssignee = {
	userId: string;
	username: string | null;
	fullName?: string | null;
	avatarUrl?: string | null;
};

type TaskAssigneesProps = {
	assignees?: TaskAssignee[];
};

const getDisplayName = (assignee?: TaskAssignee) => {
	return (
		assignee?.fullName?.trim() || assignee?.username?.trim() || "Unassigned"
	);
};

const getInitials = (name: string) => {
	return name
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
};

const TaskAssignees = ({ assignees = [] }: TaskAssigneesProps) => {
	if (assignees.length === 0) {
		return null;
	}

	if (assignees.length === 1) {
		const assignee = assignees[0];
		const name = getDisplayName(assignee);

		return (
			<Avatar className='size-8'>
				<AvatarImage src={assignee.avatarUrl ?? undefined} alt={name} />
				<AvatarFallback>{getInitials(name)}</AvatarFallback>
			</Avatar>
		);
	}

	return (
		<AvatarGroup className='grayscale'>
			{assignees.map((assignee) => {
				const name = getDisplayName(assignee);

				return (
					<Avatar key={assignee.userId} className='size-8'>
						<AvatarImage
							src={assignee.avatarUrl ?? undefined}
							alt={name}
						/>
						<AvatarFallback>{getInitials(name)}</AvatarFallback>
					</Avatar>
				);
			})}
		</AvatarGroup>
	);
};

export default TaskAssignees;
