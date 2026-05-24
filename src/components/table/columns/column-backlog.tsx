"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { GripVertical, MoreHorizontal } from "lucide-react";

export const columnsBacklog: ColumnDef<TaskItem>[] = [
	{
		id: "drag",
		size: 36,
		header: "",
		cell: () => (
			<GripVertical
				size={15}
				className='cursor-grab text-muted-foreground'
			/>
		),
	},
	{
		id: "select",
		size: 42,
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
			/>
		),
	},
	{
		accessorKey: "key",
		size: 90,
		header: "ID",
		cell: ({ row }) => (
			<span className='text-sm font-medium text-muted-foreground'>
				{row.original.key}
			</span>
		),
	},
	{
		accessorKey: "title",
		size: 300,
		header: "Công việc",
		cell: ({ row }) => (
			<div className='font-medium text-foreground'>
				{row.original.title}
			</div>
		),
	},
	{
		accessorKey: "priorityName",
		size: 140,
		header: "Ưu tiên",
		cell: ({ row }) => (
			<span
				className={cn(
					"inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
					row.original.priorityName === "Cao" &&
						"border-red-500/20 bg-red-500/10 text-red-400",
					row.original.priorityName === "Trung bình" &&
						"border-orange-500/20 bg-orange-500/10 text-orange-400",
					row.original.priorityName === "Thấp" &&
						"border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
				)}
			>
				{row.original.priorityName}
			</span>
		),
	},
	{
		accessorKey: "assigneeName",
		size: 190,
		header: "Người phụ trách",
		cell: ({ row }) => (
			<div className='flex items-center gap-2'>
				<div className='flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground'>
					{row.original.assigneeName.charAt(0)}
				</div>

				<span className='text-sm'>
					{row.original.assigneeName || "Chưa giao"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "storyPoint",
		size: 70,
		header: "SP",
		cell: ({ row }) => (
			<span className='font-medium'>
				{row.original.storyPoint ?? "-"}
			</span>
		),
	},
	{
		accessorKey: "labels",
		size: 180,
		header: "Nhãn",
		cell: ({ row }) => (
			<div className='flex flex-wrap gap-1'>
				{row.original.labels.map((label) => (
					<span
						key={label}
						className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
					>
						{label}
					</span>
				))}
			</div>
		),
	},
	{
		id: "actions",
		size: 44,
		header: "",
		cell: () => (
			<button className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'>
				<MoreHorizontal size={16} />
			</button>
		),
	},
];
export type TaskItem = {
	id: string;
	key: string;
	title: string;
	priorityName: "Cao" | "Trung bình" | "Thấp";
	assigneeName: string;
	storyPoint: number;
	labels: string[];
};

export const fakeBacklogTasks: TaskItem[] = [
	{
		id: "1",
		key: "WEB-101",
		title: "Thiết kế màn hình đăng nhập",
		priorityName: "Cao",
		assigneeName: "Nguyễn A",
		storyPoint: 5,
		labels: ["ui"],
	},
	{
		id: "2",
		key: "WEB-102",
		title: "Tạo API phân quyền",
		priorityName: "Cao",
		assigneeName: "Trần B",
		storyPoint: 8,
		labels: ["backend", "api"],
	},
	{
		id: "3",
		key: "WEB-103",
		title: "Cập nhật board kéo thả",
		priorityName: "Trung bình",
		assigneeName: "Lê C",
		storyPoint: 3,
		labels: ["ui"],
	},
	{
		id: "4",
		key: "WEB-104",
		title: "Tối ưu dashboard thống kê",
		priorityName: "Trung bình",
		assigneeName: "Phạm D",
		storyPoint: 5,
		labels: ["dashboard"],
	},
	{
		id: "5",
		key: "WEB-105",
		title: "Viết unit test cho API",
		priorityName: "Thấp",
		assigneeName: "Trần B",
		storyPoint: 3,
		labels: ["backend", "test"],
	},
	{
		id: "6",
		key: "WEB-106",
		title: "Thiết lập CI/CD pipeline",
		priorityName: "Trung bình",
		assigneeName: "Hoàng E",
		storyPoint: 5,
		labels: ["devops"],
	},
	{
		id: "7",
		key: "WEB-107",
		title: "Cải thiện hiệu năng trang chủ",
		priorityName: "Thấp",
		assigneeName: "Nguyễn A",
		storyPoint: 2,
		labels: ["frontend"],
	},
	{
		id: "8",
		key: "WEB-108",
		title: "Tích hợp thanh toán VNPAY",
		priorityName: "Cao",
		assigneeName: "Lê C",
		storyPoint: 8,
		labels: ["api", "payment"],
	},
	{
		id: "9",
		key: "WEB-109",
		title: "Tạo màn hình danh sách sprint",
		priorityName: "Trung bình",
		assigneeName: "Phạm D",
		storyPoint: 5,
		labels: ["sprint", "ui"],
	},
	{
		id: "10",
		key: "WEB-110",
		title: "Tạo chức năng tạo sprint mới",
		priorityName: "Cao",
		assigneeName: "Trần B",
		storyPoint: 8,
		labels: ["backend", "sprint"],
	},
	{
		id: "11",
		key: "WEB-111",
		title: "Move task từ backlog vào sprint",
		priorityName: "Cao",
		assigneeName: "Lê C",
		storyPoint: 8,
		labels: ["sprint", "drag-drop"],
	},
	{
		id: "12",
		key: "WEB-112",
		title: "Validate task đã nằm trong sprint khác",
		priorityName: "Trung bình",
		assigneeName: "Hoàng E",
		storyPoint: 3,
		labels: ["backend"],
	},
	{
		id: "13",
		key: "WEB-113",
		title: "Tạo API start sprint",
		priorityName: "Cao",
		assigneeName: "Trần B",
		storyPoint: 5,
		labels: ["api", "sprint"],
	},
	{
		id: "14",
		key: "WEB-114",
		title: "Tạo API complete sprint",
		priorityName: "Cao",
		assigneeName: "Trần B",
		storyPoint: 5,
		labels: ["api", "sprint"],
	},
	{
		id: "15",
		key: "WEB-115",
		title: "Thiết kế empty state cho backlog",
		priorityName: "Thấp",
		assigneeName: "Nguyễn A",
		storyPoint: 2,
		labels: ["ui"],
	},
	{
		id: "16",
		key: "WEB-116",
		title: "Thêm loading skeleton cho bảng task",
		priorityName: "Thấp",
		assigneeName: "Phạm D",
		storyPoint: 2,
		labels: ["ui", "ux"],
	},
	{
		id: "17",
		key: "WEB-117",
		title: "Tối ưu query danh sách task theo project",
		priorityName: "Trung bình",
		assigneeName: "Hoàng E",
		storyPoint: 5,
		labels: ["backend", "performance"],
	},
	{
		id: "18",
		key: "WEB-118",
		title: "Thêm filter theo priority",
		priorityName: "Trung bình",
		assigneeName: "Lê C",
		storyPoint: 3,
		labels: ["filter", "ui"],
	},
	{
		id: "19",
		key: "WEB-119",
		title: "Thêm search task theo title",
		priorityName: "Trung bình",
		assigneeName: "Nguyễn A",
		storyPoint: 3,
		labels: ["search"],
	},
	{
		id: "20",
		key: "WEB-120",
		title: "Thêm sort theo story point",
		priorityName: "Thấp",
		assigneeName: "Phạm D",
		storyPoint: 2,
		labels: ["table"],
	},
	{
		id: "21",
		key: "WEB-121",
		title: "Gắn permission cho sprint planning",
		priorityName: "Cao",
		assigneeName: "Trần B",
		storyPoint: 8,
		labels: ["rbac", "backend"],
	},
	{
		id: "22",
		key: "WEB-122",
		title: "Tạo lịch sử thay đổi sprint",
		priorityName: "Trung bình",
		assigneeName: "Hoàng E",
		storyPoint: 5,
		labels: ["audit-log"],
	},
	{
		id: "23",
		key: "WEB-123",
		title: "Cập nhật responsive cho sprint page",
		priorityName: "Thấp",
		assigneeName: "Nguyễn A",
		storyPoint: 3,
		labels: ["responsive", "ui"],
	},
	{
		id: "24",
		key: "WEB-124",
		title: "Refactor hook useSprint",
		priorityName: "Trung bình",
		assigneeName: "Lê C",
		storyPoint: 5,
		labels: ["frontend", "refactor"],
	},
	{
		id: "25",
		key: "WEB-125",
		title: "Viết tài liệu luồng sprint planning",
		priorityName: "Thấp",
		assigneeName: "Phạm D",
		storyPoint: 2,
		labels: ["docs"],
	},
];
