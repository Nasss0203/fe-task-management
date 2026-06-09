import {
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
import { useTask, useTaskStatus } from "@/features/task/hooks/useTask";
import { StatusBadge } from "@/components/shared/status-badge";

type DropdownTaskStatusProps = {
	workspaceId: string;
	projectId: string;
	statusName: string;
	taskId: string;
};

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
			<DropdownMenuTriggerV2 className='cursor-pointer outline-none'>
				<StatusBadge
					statusName={currentStatus?.name ?? statusName}
					isDone={currentStatus?.isDone}
				/>
			</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-56 rounded-2xl border-neutral-800 bg-neutral-950 p-1 shadow-2xl'>
				<DropdownMenuGroupV2>
					<DropdownMenuItemV2 className="focus:bg-neutral-900 rounded-lg cursor-pointer transition-colors">
						<StatusBadge
							statusName={currentStatus?.name ?? statusName}
							isDone={currentStatus?.isDone}
						/>
					</DropdownMenuItemV2>
				</DropdownMenuGroupV2>

				<DropdownMenuSeparatorV2 className="border-neutral-800 my-1" />

				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2 className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
						Change Status
					</DropdownMenuLabelV2>

					{statuses.map((status) => (
						<Fragment key={status.id}>
							<DropdownMenuSeparatorV2 className="border-neutral-800" />

							<DropdownMenuItemV2
								className="focus:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
								onClick={() => handleUpdateTask(status.id)}
							>
								<StatusBadge
									statusName={status.name}
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
