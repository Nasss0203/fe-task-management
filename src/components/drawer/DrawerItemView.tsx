"use client";

import { Ellipsis } from "lucide-react";
import { useMemo } from "react";
import { columns, TaskTableRow } from "../table/columns";
import { DataTable } from "../table/data-table";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "../ui/drawer";

type DrawerItemViewProps = {
	name: string;
	workspaceId: string;
	projectId: string;
	statusName: string;
	taskId: string;
	deadline?: string;
};

export function DrawerItemView({
	name,
	projectId,
	statusName,
	taskId,
	workspaceId,
	deadline = "",
}: DrawerItemViewProps) {
	const data = useMemo<TaskTableRow[]>(
		() => [
			{
				name,
				deadline,
				workspaceId,
				projectId,
				statusName,
				taskId,
			},
		],
		[name, deadline, workspaceId, projectId, statusName, taskId],
	);

	return (
		<Drawer direction='right'>
			<DrawerTrigger className='rounded-sm p-1 hover:bg-neutral-500 dark:hover:bg-neutral-400'>
				<Ellipsis size={16} />
			</DrawerTrigger>

			<DrawerContent className='data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-3xl p-5'>
				<DrawerHeader>
					<DrawerTitle>
						<input
							type='text'
							value={name}
							readOnly
							className='w-full resize-none overflow-hidden border-none bg-transparent text-4xl font-extrabold outline-none ring-0 placeholder:font-bold focus:outline-none focus:ring-0'
						/>
					</DrawerTitle>
					<DrawerDescription className='text-lg'>
						This action cannot be undone.
					</DrawerDescription>
				</DrawerHeader>

				<section>
					<DataTable columns={columns} data={data} />
				</section>

				<DrawerFooter />
			</DrawerContent>
		</Drawer>
	);
}
