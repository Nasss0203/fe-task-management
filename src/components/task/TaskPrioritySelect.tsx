"use client";

import { getUserFacingPriorityStyle } from "@/components/shared/priority-badge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

type TaskPriorityOption = {
	id: string | null;
	name: string;
	color?: string | null;
};

type TaskPrioritySelectProps = {
	priorities: TaskPriorityOption[];
	value?: string | null;
	onChange?: (value: string | null) => void;
	className?: string;
};

const TaskPrioritySelect = ({
	priorities,
	value,
	onChange,
	className,
}: TaskPrioritySelectProps) => {
	const safePriorities = Array.isArray(priorities) ? priorities : [];

	const selected = safePriorities.find((item) => item.id === value);
	const selectedStyle = getUserFacingPriorityStyle(selected?.name);

	return (
		<div
			onPointerDown={(event) => event.stopPropagation()}
			onClick={(event) => event.stopPropagation()}
		>
			<Select 
				value={value ?? "none"} 
				onValueChange={(val) => onChange?.(val === "none" ? null : val)}
			>
				<SelectTrigger
					className={cn(
						"h-8 w-fit min-w-[130px] rounded-md border px-3 py-1 text-xs font-medium shadow-none focus:ring-0 transition-colors",
						selectedStyle.badge,
						className
					)}
				>
					<div className='flex items-center gap-2'>
						<span
							className={cn(
								"size-1.5 rounded-full",
								selectedStyle.dot,
							)}
						/>
						<span>{selected?.name || "Priority"}</span>
					</div>
				</SelectTrigger>

				<SelectContent
					align='start'
					position='popper'
					className='z-[9999] min-w-[160px] rounded-xl border border-border bg-background p-1 shadow-2xl'
				>
					{safePriorities.map((priority) => {
						const style = getUserFacingPriorityStyle(priority.name);
						const isSelected = priority.id === value;
						const itemValue = priority.id ?? "none";

						return (
							<SelectItem
								key={itemValue}
								value={itemValue}
								className={cn(
									"cursor-pointer rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:focus:bg-accent focus:text-foreground",
									isSelected ? "bg-muted/50 text-foreground" : "text-foreground"
								)}
							>
								<div className='flex items-center gap-2.5'>
									<span
										className={cn(
											"size-1.5 rounded-full",
											style.dot,
										)}
									/>
									<span className="font-medium">{priority.name}</span>
								</div>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
};

export default TaskPrioritySelect;