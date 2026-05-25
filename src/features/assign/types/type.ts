import { Assignee } from "@/services/assign/type";

export interface AssigneeAvatarProps {
	assignee: Assignee;
}

export interface AssigneeSelectorProps {
	taskId: string;
	currentAssignees: Assignee[];
	onAssign?: (userId: string) => void;
	onUnassign?: (userId: string) => void;
}

export type MemberOption = {
	id: string;
	name: string;
	email?: string;
	avatarUrl?: string | null;
	isMe?: boolean;
};
