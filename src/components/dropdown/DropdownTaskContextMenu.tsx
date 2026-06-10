"use client";

import { ExternalLink, Pencil, Trash } from "lucide-react";
import React, { useState } from "react";
import { useDeleteTask } from "@/features/task/hooks/useTask";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

type Props = {
	children: React.ReactNode;
	taskId: string;
	workspaceId: string;
	projectId: string;
	onRename?: () => void;
	onOpenDetail?: () => void;
};

const DropdownTaskContextMenu = ({ children, taskId, workspaceId, projectId, onRename, onOpenDetail }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const deleteTask = useDeleteTask(workspaceId, projectId);

	const handleDelete = () => {
		setIsOpen(false);
		deleteTask.mutate({ taskId });
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				{children}
			</PopoverTrigger>

			<PopoverContent
				align='end'
				side='bottom'
				sideOffset={8}
				onClick={(e) => e.stopPropagation()}
				onPointerDown={(e) => e.stopPropagation()}
				className='w-72 rounded-xl border border-border bg-popover p-0 shadow-xl'
			>
				<Command className='bg-transparent'>
					<CommandList>
						<CommandEmpty>Không tìm thấy hành động.</CommandEmpty>

						<CommandGroup heading='Công việc' className='px-2 pb-2 pt-2'>
							<CommandItem
								value='doi ten task'
								onSelect={() => {
									setIsOpen(false);
									onRename?.();
								}}
								className='cursor-pointer rounded-lg px-2 py-2'
							>
								<Pencil size={16} />
								<span>Đổi tên task</span>
							</CommandItem>

							<CommandItem
								value='mo chi tiet'
								onSelect={() => {
									setIsOpen(false);
									onOpenDetail?.();
								}}
								className='cursor-pointer rounded-lg px-2 py-2'
							>
								<ExternalLink size={16} />
								<span>Mở chi tiết</span>
							</CommandItem>

							<CommandItem
								value='delete_task'
								onSelect={handleDelete}
								className='cursor-pointer rounded-lg px-2 py-2 text-red-500 data-[selected=true]:bg-red-500/10 data-[selected=true]:text-red-500'
							>
								<Trash size={16} className='text-red-500' />
								<span>Xóa task</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default DropdownTaskContextMenu;
