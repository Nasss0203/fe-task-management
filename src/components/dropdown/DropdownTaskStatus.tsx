import {
	normalizeTaskStatusName,
} from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import { Fragment, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuSeparatorV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "./dropdown-custom";
import { useUpdateTask, useTaskStatus } from "@/features/task/hooks/useTask";
import { getUserFacingStatusStyle } from "@/components/shared/status-badge";

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
	const { mutateAsync } = useUpdateTask(workspaceId, projectId);

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

	const currentStyle = getUserFacingStatusStyle(currentStatus?.name ?? statusName, currentStatus?.isDone);

	return (
		<DropdownMenuV2>
			<DropdownMenuTriggerV2 className='cursor-pointer outline-none'>
				<div className='flex items-center gap-2 w-fit rounded-md border border-transparent hover:bg-accent/50 px-2 py-1 transition-colors'>
					<span
						className={cn(
							"size-2 rounded-full",
							currentStyle.dot,
						)}
					/>
					<span className="text-[13px] font-medium text-foreground">{currentStatus?.name ?? statusName ?? "Status"}</span>
					<ChevronDown className="h-3 w-3 text-muted-foreground" />
				</div>
			</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-56 rounded-2xl border-border bg-popover p-1 shadow-2xl z-[9999]'>
				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2 className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
						STATUS
					</DropdownMenuLabelV2>

					{statuses.map((status) => {
						const style = getUserFacingStatusStyle(status.name, status.isDone);
						const isSelected = currentStatus?.id === status.id;

						return (
							<Fragment key={status.id}>
								<DropdownMenuItemV2
									className={cn(
										"focus:focus:bg-accent rounded-xl cursor-pointer transition-colors px-3 py-2 mt-1 first:mt-0",
										isSelected && "bg-muted/50"
									)}
									onClick={() => handleUpdateTask(status.id)}
								>
									<div className="flex items-center justify-between w-full">
										<div className="flex items-center gap-3">
											<span
												className={cn(
													"size-2.5 rounded-full",
													style.dot,
												)}
											/>
											<span className="font-semibold text-[13px]">{status.name}</span>
										</div>
										{isSelected && <Check className="h-4 w-4 text-blue-500" />}
									</div>
								</DropdownMenuItemV2>
							</Fragment>
						);
					})}
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
};

export default DropdownTaskStatus;
