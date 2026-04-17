import { ColumnDef } from "@tanstack/react-table";
import { DatePickerInput } from "../data-picker/DatePickerInput";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuSeparatorV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "../dropdown/dropdown-custom";

type TaskItem = {
	name: string;
	status: string;
	deadline: string;
};

export const columns: ColumnDef<TaskItem>[] = [
	{
		accessorKey: "name",
		header: "Người được giao",
		cell: ({ row }) => (
			<div className='flex items-center gap-2'>
				<div className='flex h-7 w-7 items-center justify-center rounded-full border text-xs'>
					{row.original.name.charAt(0)}
				</div>
				<span>{row.original.name}</span>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Trạng thái",
		cell: ({ row }) => (
			<DropdownMenuV2>
				<DropdownMenuTriggerV2 className='cursor-pointer'>
					<span className='rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300'>
						{row.original.status}
					</span>
				</DropdownMenuTriggerV2>
				<DropdownMenuContentV2 className='w-64'>
					<DropdownMenuGroupV2>
						<DropdownMenuItemV2>
							<span className='rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300'>
								{row.original.status}
							</span>
						</DropdownMenuItemV2>
					</DropdownMenuGroupV2>
					<DropdownMenuSeparatorV2 />
					<DropdownMenuGroupV2>
						<DropdownMenuLabelV2>Việc cần làm</DropdownMenuLabelV2>
						<DropdownMenuItemV2>
							<span className='rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300'>
								{row.original.status}
							</span>
						</DropdownMenuItemV2>
					</DropdownMenuGroupV2>
					<DropdownMenuSeparatorV2 />
					<DropdownMenuGroupV2>
						<DropdownMenuLabelV2>
							Đang thực hiện
						</DropdownMenuLabelV2>
						<DropdownMenuItemV2>
							<span className='rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300'>
								{row.original.status}
							</span>
						</DropdownMenuItemV2>
					</DropdownMenuGroupV2>
					<DropdownMenuSeparatorV2 />
					<DropdownMenuGroupV2>
						<DropdownMenuLabelV2>Hoàn tất</DropdownMenuLabelV2>
						<DropdownMenuItemV2>
							<span className='rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300'>
								{row.original.status}
							</span>
						</DropdownMenuItemV2>
					</DropdownMenuGroupV2>
				</DropdownMenuContentV2>
			</DropdownMenuV2>
		),
	},
	{
		accessorKey: "deadline",
		header: "Hạn chót",
		cell: ({ row }) => {
			return (
				<DatePickerInput
					value={row.original.deadline}
					onChange={(newValue) => {
						console.log("row:", row.index, "deadline:", newValue);
					}}
				/>
			);
		},
	},
];
