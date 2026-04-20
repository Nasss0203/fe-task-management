import { ColumnDef } from "@tanstack/react-table";
import { DatePickerInput } from "../data-picker/DatePickerInput";
import DropdownTaskStatus from "../dropdown/DropdownTaskStatus";

export type TaskTableRow = {
	name: string;
	deadline: string;
	workspaceId: string;
	projectId: string;
	statusName: string;
	taskId: string;
};

export const columns: ColumnDef<TaskTableRow>[] = [
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
		accessorKey: "statusName",
		header: "Trạng thái",
		cell: ({ row }) => (
			<DropdownTaskStatus
				projectId={row.original.projectId}
				workspaceId={row.original.workspaceId}
				taskId={row.original.taskId}
				statusName={row.original.statusName}
			/>
		),
	},
	{
		accessorKey: "deadline",
		header: "Hạn chót",
		cell: ({ row }) => (
			<DatePickerInput
				value={row.original.deadline}
				onChange={(newValue) => {
					console.log("row:", row.index, "deadline:", newValue);
				}}
			/>
		),
	},
];
