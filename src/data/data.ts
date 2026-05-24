import {
	ActivityItem,
	AttentionItem,
	MyTaskItem,
	ProjectItem,
	StatItem,
} from "@/types/type";
import { AlertCircle, FileText, FolderKanban, Users } from "lucide-react";

export const stats: StatItem[] = [
	{
		title: "Projects",
		value: "12",
		description: "+2 trong tuần này",
		icon: FolderKanban,
		url: "project",
	},
	{
		title: "Open Tasks",
		value: "148",
		description: "26 task cần xử lý",
		icon: FileText,
		url: "task",
	},
	{
		title: "Overdue",
		value: "9",
		description: "Cần ưu tiên hôm nay",
		icon: AlertCircle,
		url: "task",
	},
	{
		title: "Members",
		value: "23",
		description: "5 người đang hoạt động",
		icon: Users,
		url: "member",
	},
];

export const projects: ProjectItem[] = [
	{
		id: "1",
		name: "Task Management Web",
		key: "TMW",
		progress: 78,
		openTasks: 12,
		doneTasks: 42,
		deadline: "28/04/2026",
		members: ["NA", "LP", "HN"],
		status: "On Track",
	},
	{
		id: "2",
		name: "Admin Dashboard",
		key: "ADM",
		progress: 46,
		openTasks: 18,
		doneTasks: 20,
		deadline: "01/05/2026",
		members: ["NA", "TT", "QL"],
		status: "At Risk",
	},
	{
		id: "3",
		name: "Mobile App",
		key: "MBA",
		progress: 91,
		openTasks: 4,
		doneTasks: 53,
		deadline: "24/04/2026",
		members: ["HN", "LT"],
		status: "Almost Done",
	},
];

export const activities: ActivityItem[] = [
	{
		id: "1",
		user: "Nass",
		action: "đã tạo task",
		target: "Thiết kế dashboard workspace",
		time: "10 phút trước",
	},
	{
		id: "2",
		user: "Linh",
		action: "đã cập nhật status",
		target: "API create project",
		time: "32 phút trước",
	},
	{
		id: "3",
		user: "Hoàng",
		action: "đã comment vào",
		target: "Board view settings",
		time: "1 giờ trước",
	},
	{
		id: "4",
		user: "Trâm",
		action: "đã mời thành viên vào",
		target: "Workspace Frontend Team",
		time: "2 giờ trước",
	},
];

export const myTasks: MyTaskItem[] = [
	{
		id: "1",
		title: "UI dashboard workspace",
		priority: "High",
		due: "Hôm nay",
		status: "In Progress",
	},
	{
		id: "2",
		title: "Fix create board popup",
		priority: "Medium",
		due: "Ngày mai",
		status: "Todo",
	},
	{
		id: "3",
		title: "Connect stats với API",
		priority: "Low",
		due: "25/04/2026",
		status: "Review",
	},
];

export const attentionItems: AttentionItem[] = [
	{
		id: "1",
		title: "3 task quá hạn trong Admin Dashboard",
		type: "Overdue",
	},
	{
		id: "2",
		title: "2 project sắp tới deadline trong 3 ngày",
		type: "Deadline",
	},
	{
		id: "3",
		title: "5 task chưa assign người phụ trách",
		type: "Unassigned",
	},
];
