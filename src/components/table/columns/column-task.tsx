"use client";

import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState, useRef } from "react";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";
import { useTask } from "@/features/task/hooks/useTask";
import { useMember } from "@/features/member/hooks/useMember";
import { useUser } from "@/features/auth/hooks/useUser";
import { TaskAssigneeSelect } from "@/components/task/TaskAssignSelect";
import { MoreHorizontal } from "lucide-react";

type TaskItem = {
	id: string;
	title: string;
	assigneeName: string | null;
	assignees?: {
		userId: string;
		username: string | null;
		fullName?: string | null;
		avatarUrl?: string | null;
	}[];
	priorityName: string | null;
	statusName: string;
	estimateMinutes: number | null;
};

type UseBacklogColumnsParams = {
	projectId?: string;
	workspaceId?: string;
};

export const TaskNameCell = ({ taskId, workspaceId, projectId, initialTitle }: any) => {
	const [title, setTitle] = useState(initialTitle);
	const { updateTask } = useTask(workspaceId, projectId);
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSave = () => {
		setIsEditing(false);
		if (title.trim() && title !== initialTitle) {
			updateTask.mutate({ id: taskId, title });
		} else {
			setTitle(initialTitle);
		}
	};

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				onBlur={handleSave}
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSave();
					if (e.key === "Escape") {
						setTitle(initialTitle);
						setIsEditing(false);
					}
				}}
				className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-foreground focus:ring-0 p-0 m-0 h-7 px-1 -ml-1 rounded border-ring focus:border-border"
				autoFocus
			/>
		);
	}

	return (
		<div 
			className="text-[13px] font-medium text-foreground truncate cursor-text w-full hover:bg-accent/50 rounded transition-colors h-7 flex items-center px-1 -ml-1"
			onClick={() => setIsEditing(true)}
		>
			{title}
		</div>
	);
};

export const TaskAssigneeCell = ({ taskId, workspaceId, projectId, assignees }: any) => {
	const { findAllMember } = useMember({ workspaceId });
	const members = findAllMember.data?.data ?? [];
	const { user } = useUser();
	const { updateTask } = useTask(workspaceId, projectId);

	const memberOptions = members.map((member: any) => ({
		id: member.user_id,
		name: member.full_name,
		email: member.email,
		avatarUrl: member.avatar_url,
		isMe: member.user_id === user?.id,
	}));

	const value = assignees?.map((a: any) => a.userId) ?? [];

	const handleChange = (newValue: string[]) => {
		updateTask.mutate({ id: taskId, assigneeIds: newValue });
	};

	return (
		<div className="-ml-2">
			<TaskAssigneeSelect
				members={memberOptions}
				value={value}
				onChange={handleChange}
			/>
		</div>
	);
};

export const useBacklogColumns = ({
	projectId,
	workspaceId,
}: UseBacklogColumnsParams) => {
	const columns = React.useMemo<ColumnDef<TaskItem>[]>(
		() => [
			{
				accessorKey: "title",
				id: "title",
				size: 260,
				header: "Task Name",
				cell: ({ row }) => (
					<TaskNameCell 
						taskId={row.original.id}
						workspaceId={workspaceId}
						projectId={projectId}
						initialTitle={row.original.title}
					/>
				),
			},
			{
				accessorKey: "assigneeName",
				id: "assigneeName",
				size: 180,
				header: "Assignee",
				cell: ({ row }) => (
					<TaskAssigneeCell 
						taskId={row.original.id}
						workspaceId={workspaceId}
						projectId={projectId}
						assignees={row.original.assignees}
					/>
				),
			},
			{
				accessorKey: "priorityName",
				id: "priorityName",
				size: 140,
				header: "Priority",
				cell: ({ row }) => (
					<div className="-ml-2">
						<DropdownTaskPriority
							taskId={row.original.id}
							projectId={projectId as string}
							workspaceId={workspaceId as string}
							priorityName={row.original.priorityName}
						/>
					</div>
				),
			},
			{
				accessorKey: "statusName",
				id: "statusName",
				size: 160,
				header: "Status",
				cell: ({ row }) => (
					<div className="-ml-2">
						<DropdownTaskStatus
							taskId={row.original.id}
							projectId={projectId as string}
							workspaceId={workspaceId as string}
							statusName={row.original.statusName}
						/>
					</div>
				),
			},
			{
				id: "actions",
				size: 140,
				header: "Action",
				cell: ({ row }) => (
					<button className='rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'>
						<MoreHorizontal size={14} />
					</button>
				),
			},
		],
		[projectId, workspaceId],
	);

	return columns;
};
