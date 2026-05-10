"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

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
};

const getColor = (color?: string | null) => {
	return color || "#737373";
};

const withAlpha = (color: string, alpha: string) => {
	if (color.startsWith("#") && color.length === 7) {
		return `${color}${alpha}`;
	}

	return color;
};

const TaskStatusSelect = ({
	statuses,
	value,
	onChange,
}: TaskStatusSelectProps) => {
	const safeStatuses = Array.isArray(statuses) ? statuses : [];

	const selected = safeStatuses.find((item) => item.id === value);

	return (
		<div
			onPointerDown={(event) => event.stopPropagation()}
			onClick={(event) => event.stopPropagation()}
		>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					className='h-8 w-fit min-w-37.5 rounded-full border px-3 py-1 text-sm font-semibold shadow-none focus:ring-0'
					style={{
						backgroundColor: withAlpha(
							getColor(selected?.color),
							"26",
						),
						borderColor: withAlpha(getColor(selected?.color), "55"),
						color: selected?.color || "#e5e5e5",
					}}
				>
					<div className='flex items-center gap-2'>
						<span
							className='size-2 rounded-full'
							style={{
								backgroundColor: getColor(selected?.color),
							}}
						/>

						<span>{selected?.name || "Chọn trạng thái"}</span>
					</div>
				</SelectTrigger>

				<SelectContent
					align='start'
					position='popper'
					className='z-[9999] min-w-45 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl'
				>
					{safeStatuses.map((status) => {
						const color = getColor(status.color);

						return (
							<SelectItem
								key={status.id}
								value={status.id}
								className='cursor-pointer rounded-lg px-3 py-2 text-sm focus:bg-accent focus:text-accent-foreground'
							>
								<div className='flex items-center gap-2'>
									<span
										className='size-2 rounded-full'
										style={{
											backgroundColor: color,
										}}
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
