"use client";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { Filter, Plus } from "lucide-react";
import { useState } from "react";
import PanigationTable from "../panigation/PanigationTable";
import BacklogTable from "../table/BacklogTable";
import {
	columnsBacklog,
	fakeBacklogTasks,
} from "../table/columns/column-backlog";
import { Button } from "../ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "../ui/combobox";

const frameworks = ["Workspace", "project", "Nuxt.js", "Remix", "Astro"];

const BacklogSprint = () => {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data: fakeBacklogTasks,
		columns: columnsBacklog,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});

	return (
		<section className='col-span-12 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#171717] shadow-sm xl:col-span-6'>
			<div className='shrink-0 border-b border-[#2a2a2a] p-5'>
				<div>
					<h3 className='text-base font-bold text-white'>Backlog</h3>
					<p className='mt-1 text-xs font-medium text-slate-400'>
						Chọn công việc để thêm vào sprint
					</p>
				</div>

				<div className='mt-5 flex flex-wrap items-center gap-2'>
					<Combobox items={frameworks}>
						<ComboboxInput
							placeholder='Select a framework'
							readOnly
							className='cursor-pointer caret-transparent select-none'
							onMouseDown={(e) => e.preventDefault()}
						/>
						<ComboboxContent>
							<ComboboxEmpty>No items found.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem key={item} value={item}>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>

					<Combobox items={frameworks}>
						<ComboboxInput
							placeholder='Select a framework'
							readOnly
							className='cursor-pointer caret-transparent select-none'
							onMouseDown={(e) => e.preventDefault()}
						/>
						<ComboboxContent>
							<ComboboxEmpty>No items found.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem key={item} value={item}>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
					<Button variant={"outline"}>
						<Filter></Filter>
					</Button>

					<Button className='bg-blue-600 hover:bg-blue-500 ml-auto text-white'>
						<Plus size={15} />
						Thêm công việc
					</Button>
				</div>
			</div>

			<BacklogTable
				table={table}
				className='min-h-0 flex-1 rounded-none border-0 overflow-y-auto'
			/>

			<PanigationTable table={table} />
		</section>
	);
};

export default BacklogSprint;
