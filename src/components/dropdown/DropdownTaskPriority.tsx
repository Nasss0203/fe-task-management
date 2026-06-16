import {
	getUserFacingPriorityStyle,
} from "@/components/shared/priority-badge";
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
import { useUpdateTask, useTaskPriority } from "@/features/task/hooks/useTask";
import { Check, ChevronDown } from "lucide-react";

type DropdownTaskPriorityProps = {
	workspaceId: string;
	projectId: string;
	priorityName: string | null;
	taskId: string;
};

const DropdownTaskPriority = ({
	projectId,
	workspaceId,
	priorityName,
	taskId,
}: DropdownTaskPriorityProps) => {
	const taskPriorityQuery = useTaskPriority(workspaceId, projectId);
	const { mutateAsync } = useUpdateTask(workspaceId, projectId);

	const priorities = useMemo(
		() => taskPriorityQuery.data?.data ?? [],
		[taskPriorityQuery.data?.data],
	);

	const currentPriority = useMemo(() => {
		return priorities.find(
			(item) => item.name === priorityName
		);
	}, [priorities, priorityName]);

	const currentStyle = getUserFacingPriorityStyle(currentPriority?.name ?? priorityName);

	const handleUpdateTask = async (nextPriorityId: string | null) => {
		if (!taskId) return;

		if (currentPriority?.id === nextPriorityId) return;

		try {
			await mutateAsync({
				id: taskId,
				priorityId: nextPriorityId,
			});
		} catch (error) {
			console.error("Update task priority failed:", error);
		}
	};

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
					<span className="text-[13px] font-medium text-foreground">{currentPriority?.name || priorityName || "No priority"}</span>
					<ChevronDown className="h-3 w-3 text-muted-foreground" />
				</div>
			</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-56 rounded-2xl border-border bg-popover p-1 shadow-2xl z-[9999]'>
				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2 className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
						PRIORITY
					</DropdownMenuLabelV2>

					<DropdownMenuItemV2
						className={cn(
							"focus:focus:bg-accent rounded-xl cursor-pointer transition-colors px-3 py-2 mt-1 first:mt-0",
							!currentPriority && !priorityName && "bg-muted/50"
						)}
						onClick={() => handleUpdateTask(null)}
					>
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center gap-3">
								<span className="size-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
								<span className="font-semibold text-[13px]">No priority</span>
							</div>
							{!currentPriority && !priorityName && <Check className="h-4 w-4 text-blue-500" />}
						</div>
					</DropdownMenuItemV2>

					{priorities.map((priority) => {
						const style = getUserFacingPriorityStyle(priority.name);
						const isSelected = currentPriority?.id === priority.id;

						return (
							<Fragment key={priority.id}>
								<DropdownMenuItemV2
									className={cn(
										"focus:focus:bg-accent rounded-xl cursor-pointer transition-colors px-3 py-2 mt-1 first:mt-0",
										isSelected && "bg-muted/50"
									)}
									onClick={() => handleUpdateTask(priority.id)}
								>
									<div className="flex items-center justify-between w-full">
										<div className="flex items-center gap-3">
											<span
												className={cn(
													"size-2.5 rounded-full",
													style.dot,
												)}
											/>
											<span className="font-semibold text-[13px]">{priority.name}</span>
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

export default DropdownTaskPriority;
