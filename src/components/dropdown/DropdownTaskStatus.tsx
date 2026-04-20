import { useTask, useTaskStatus } from "@/hooks/use-task";
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

type DropdownTaskStatusProps = {
	workspaceId: string;
	projectId: string;
	statusName: string;
	taskId: string;
};

const normalizeStatusName = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[\s_-]+/g, "");

const hexToRgba = (hex: string, alpha = 0.2) => {
	const cleanHex = hex.replace("#", "");

	if (cleanHex.length !== 6) {
		return `rgba(148, 163, 184, ${alpha})`;
	}

	const r = parseInt(cleanHex.slice(0, 2), 16);
	const g = parseInt(cleanHex.slice(2, 4), 16);
	const b = parseInt(cleanHex.slice(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

	const statuses = taskStatusQuery.data?.data ?? [];

	const currentStatus = useMemo(() => {
		return statuses.find(
			(item) =>
				normalizeStatusName(item.name) ===
				normalizeStatusName(statusName),
		);
	}, [statuses, statusName]);

	const currentColor = currentStatus?.color ?? "#94A3B8";

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
				<span
					className='rounded-full px-3 py-1 text-sm font-medium'
					style={{
						backgroundColor: hexToRgba(currentColor, 0.2),
						color: currentColor,
					}}
				>
					{statusName}
				</span>
			</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-64'>
				<DropdownMenuGroupV2>
					<DropdownMenuItemV2>
						<div
							className='rounded-full px-3 py-1 text-sm font-medium'
							style={{
								backgroundColor: hexToRgba(currentColor, 0.2),
								color: currentColor,
							}}
						>
							{statusName}
						</div>
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
								<div
									className='rounded-full px-3 py-1 text-sm font-medium'
									style={{
										backgroundColor: hexToRgba(
											status.color,
											0.2,
										),
										color: status.color,
									}}
								>
									{status.name}
								</div>
							</DropdownMenuItemV2>
						</Fragment>
					))}
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
};

export default DropdownTaskStatus;
