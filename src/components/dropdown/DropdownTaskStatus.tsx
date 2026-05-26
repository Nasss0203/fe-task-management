import {
	getTaskStatusStyle,
	normalizeTaskStatusName,
} from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import { Fragment, useMemo } from "react";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuSeparatorV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "./dropdown-custom";
import { useTask, useTaskStatus } from "@/hooks/use-task";

type DropdownTaskStatusProps = {
	workspaceId: string;
	projectId: string;
	statusName: string;
	taskId: string;
};

type TaskStatusPillProps = {
	name: string;
	isDone?: boolean;
};

function TaskStatusPill({ name, isDone }: TaskStatusPillProps) {
	const style = getTaskStatusStyle(name, isDone);

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
				style.badge,
			)}
		>
			<span className={cn("size-2 rounded-full", style.dot)} />
			<span>{name || style.label}</span>
		</div>
	);
}

const DropdownTaskStatus = ({
	projectId,
	workspaceId,
	statusName,
	taskId,
}: DropdownTaskStatusProps) => {
	const taskStatusQuery = useTaskStatus(workspaceId, projectId);
	const {
		updateTask: { mutateAsync },
	} = useTask(workspaceId, projectId);

	const statuses = useMemo(
		() => taskStatusQuery.data?.data ?? [],
		[taskStatusQuery.data?.data],
	);

	const currentStatus = useMemo(() => {
		return statuses.find(
			(item) =>
				normalizeTaskStatusName(item.name) ===
				normalizeTaskStatusName(statusName),
		);
	}, [statuses, statusName]);

	const handleUpdateTask = async (nextStatusId: string) => {
		if (!taskId) return;

		if (currentStatus?.id === nextStatusId) return;

		try {
			await mutateAsync({
				id: taskId,
				statusId: nextStatusId,
			});
		} catch (error) {
			console.error("Update task status failed:", error);
		}
	};

	return (
		<DropdownMenuV2>
			<DropdownMenuTriggerV2 className='cursor-pointer'>
				<TaskStatusPill
					name={currentStatus?.name ?? statusName}
					isDone={currentStatus?.isDone}
				/>
			</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-64'>
				<DropdownMenuGroupV2>
					<DropdownMenuItemV2>
						<TaskStatusPill
							name={currentStatus?.name ?? statusName}
							isDone={currentStatus?.isDone}
						/>
					</DropdownMenuItemV2>
				</DropdownMenuGroupV2>

				<DropdownMenuSeparatorV2 />

				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2>
						Danh sách trạng thái
					</DropdownMenuLabelV2>

					{statuses.map((status) => (
						<Fragment key={status.id}>
							<DropdownMenuSeparatorV2 />

							<DropdownMenuItemV2
								onClick={() => handleUpdateTask(status.id)}
							>
								<TaskStatusPill
									name={status.name}
									isDone={status.isDone}
								/>
							</DropdownMenuItemV2>
						</Fragment>
					))}
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
};

export default DropdownTaskStatus;
