import type { ElementType, ReactNode } from "react";

export type DetailRowProps = {
	icon: ElementType;
	label: string;
	children: ReactNode;
	className?: string;
};

export type LocalComment = {
	id: string;
	authorName: string;
	authorAvatar?: string;
	body: string;
	createdAt: string;
};

export type LocalAttachment = {
	id: string;
	name: string;
	size: string;
	kind: string;
};

export type LocalSubtask = {
	id: string;
	title: string;
	note: string;
	done: boolean;
};

export type ActivityEntry = {
	id: string;
	label: string;
	time: string;
	description: string;
};

export type MemberOption = {
	id: string;
	name: string;
	email?: string;
	avatarUrl?: string | null;
	isMe?: boolean;
};
