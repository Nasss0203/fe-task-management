import {
	Cell,
	ColumnDef,
	Header,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import React, { CSSProperties } from "react";

import {
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Person = {
	id: string;
	firstName: string;
	lastName: string;
	age: number;
	visits: number;
	status: "Todo" | "In Progress" | "Done";
	progress: number;
};

const defaultData: Person[] = [
	{
		id: "1",
		firstName: "Nguyen",
		lastName: "An",
		age: 24,
		visits: 12,
		status: "Todo",
		progress: 25,
	},
	{
		id: "2",
		firstName: "Tran",
		lastName: "Binh",
		age: 28,
		visits: 30,
		status: "In Progress",
		progress: 55,
	},
	{
		id: "3",
		firstName: "Le",
		lastName: "Cuong",
		age: 22,
		visits: 8,
		status: "Done",
		progress: 100,
	},
	{
		id: "4",
		firstName: "Pham",
		lastName: "Dung",
		age: 26,
		visits: 17,
		status: "Todo",
		progress: 10,
	},
	{
		id: "5",
		firstName: "Hoang",
		lastName: "Giang",
		age: 30,
		visits: 22,
		status: "In Progress",
		progress: 70,
	},
];

const DraggableTableHeader = ({
	header,
}: {
	header: Header<Person, unknown>;
}) => {
	const { attributes, isDragging, listeners, setNodeRef, transform } =
		useSortable({
			id: header.column.id,
		});

	const style: CSSProperties = {
		opacity: isDragging ? 0.8 : 1,
		position: "relative",
		transform: CSS.Translate.toString(transform),
		transition: "width transform 0.2s ease-in-out",
		whiteSpace: "nowrap",
		width: header.column.getSize(),
		zIndex: isDragging ? 1 : 0,
	};

	return (
		<th colSpan={header.colSpan} ref={setNodeRef} style={style}>
			{header.isPlaceholder
				? null
				: flexRender(
						header.column.columnDef.header,
						header.getContext(),
					)}
			<button {...attributes} {...listeners} className='ml-2'>
				🟰
			</button>
		</th>
	);
};

const DragAlongCell = ({ cell }: { cell: Cell<Person, unknown> }) => {
	const { isDragging, setNodeRef, transform } = useSortable({
		id: cell.column.id,
	});

	const style: CSSProperties = {
		opacity: isDragging ? 0.8 : 1,
		position: "relative",
		transform: CSS.Translate.toString(transform),
		transition: "width transform 0.2s ease-in-out",
		width: cell.column.getSize(),
		zIndex: isDragging ? 1 : 0,
	};

	return (
		<td style={style} ref={setNodeRef} className='border px-3 py-2'>
			{flexRender(cell.column.columnDef.cell, cell.getContext())}
		</td>
	);
};

const BoardTable = () => {
	const columns = React.useMemo<ColumnDef<Person>[]>(
		() => [
			{
				accessorKey: "firstName",
				header: "First Name",
				cell: (info) => info.getValue(),
				id: "firstName",
				size: 150,
			},
			{
				accessorFn: (row) => row.lastName,
				cell: (info) => info.getValue(),
				header: () => <span>Last Name</span>,
				id: "lastName",
				size: 150,
			},
			{
				accessorKey: "age",
				header: () => "Age",
				id: "age",
				size: 120,
			},
			{
				accessorKey: "visits",
				header: () => <span>Visits</span>,
				id: "visits",
				size: 120,
			},
			{
				accessorKey: "status",
				header: "Status",
				id: "status",
				size: 150,
			},
			{
				accessorKey: "progress",
				header: "Profile Progress",
				id: "progress",
				size: 180,
			},
		],
		[],
	);

	const [data, setData] = React.useState<Person[]>(defaultData);
	const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
		columns.map((c) => c.id!),
	);

	const rerender = () => setData(defaultData);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnOrder,
		},
		onColumnOrderChange: setColumnOrder,
	});

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (active && over && active.id !== over.id) {
			setColumnOrder((prev) => {
				const oldIndex = prev.indexOf(active.id as string);
				const newIndex = prev.indexOf(over.id as string);
				return arrayMove(prev, oldIndex, newIndex);
			});
		}
	}

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor),
	);

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToHorizontalAxis]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<div className='p-2'>
				<div className='flex flex-wrap gap-2 mb-4'>
					<button
						onClick={rerender}
						className='border px-3 py-1 rounded'
					>
						Reset data
					</button>
				</div>

				<table className='w-full border-collapse border'>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className='border'>
								<SortableContext
									items={columnOrder}
									strategy={horizontalListSortingStrategy}
								>
									{headerGroup.headers.map((header) => (
										<DraggableTableHeader
											key={header.id}
											header={header}
										/>
									))}
								</SortableContext>
							</tr>
						))}
					</thead>

					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className='border'>
								{row.getVisibleCells().map((cell) => (
									<SortableContext
										key={cell.id}
										items={columnOrder}
										strategy={horizontalListSortingStrategy}
									>
										<DragAlongCell cell={cell} />
									</SortableContext>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</DndContext>
	);
};

export default BoardTable;
