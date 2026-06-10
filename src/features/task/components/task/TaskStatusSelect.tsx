"use client";

import { getTaskStatusStyle } from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

type TaskStatusOption = {
	id: string;
	name: string;
	color?: string | null;
	isDone?: boolean;
	position?: number;
};

type TaskStatusSelectProps = {
	statuses: TaskStatusOption[];
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
};

const TaskStatusSelect = ({
	statuses,
	value,
	onChange,
	className,
}: TaskStatusSelectProps) => {
	const safeStatuses = Array.isArray(statuses) ? statuses : [];

	const selected = safeStatuses.find((item) => item.id === value);
	const selectedStyle = getTaskStatusStyle(
		selected?.name,
		selected?.isDone,
	);

	return (
		<div
			onPointerDown={(event) => event.stopPropagation()}
			onClick={(event) => event.stopPropagation()}
		>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					className={cn(
						"h-9 w-fit min-w-[130px] rounded-lg border px-3 py-1 text-xs font-semibold shadow-sm focus:ring-0 transition-colors",
						selectedStyle.badge,
						className
					)}
				>
					<div className='flex items-center gap-2'>
						<span
							className={cn(
								"size-2 rounded-full",
								selectedStyle.dot,
							)}
						/>
						<span>{selected?.name || "Status"}</span>
					</div>
				</SelectTrigger>

				<SelectContent
					align='start'
					position='popper'
					className='z-[9999] min-w-[160px] rounded-xl border border-border bg-background p-1.5 shadow-2xl'
				>
					{safeStatuses.map((status) => {
						const style = getTaskStatusStyle(
							status.name,
							status.isDone,
						);
						const isSelected = status.id === value;

						return (
							<SelectItem
								key={status.id}
								value={status.id}
								className={cn(
									"cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium transition-all focus:bg-accent focus:text-foreground mb-0.5 last:mb-0",
									isSelected ? "bg-muted text-foreground" : "text-foreground"
								)}
							>
								<div className='flex items-center gap-2.5'>
									<span
										className={cn(
											"size-2 rounded-full",
											style.dot,
										)}
									/>
									<span>{status.name}</span>
								</div>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
};

export default TaskStatusSelect;

