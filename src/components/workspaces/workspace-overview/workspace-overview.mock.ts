import { AlertCircle, FileText, FolderKanban, Users } from "lucide-react";

export const metrics = (workspaceSlug: string) => [
  {
    label: "Dự án",
    count: 12,
    subText: "+2 trong tuần này",
    icon: FolderKanban,
    link: `/dashboard/${workspaceSlug}/projects`,
    color: "blue"
  },
  {
    label: "Task đang mở",
    count: 148,
    subText: "26 task cần xử lý",
    icon: FileText,
    link: `/dashboard/${workspaceSlug}/tasks?status=open`,
    color: "purple"
  },
  {
    label: "Quá hạn",
    count: 9,
    subText: "Cần ưu tiên hôm nay",
    icon: AlertCircle,
    link: `/dashboard/${workspaceSlug}/tasks?filter=overdue`,
    color: "red"
  },
  {
    label: "Thành viên",
    count: 23,
    subText: "5 người đang hoạt động",
    icon: Users,
    link: `/dashboard/${workspaceSlug}/members`,
    color: "green"
  }
];

export const projects = [
  {
    id: "p1",
    name: "Task Management Web",
    code: "TMW",
    status: "On Track",
    progress: 78,
    openTasks: 12,
    doneTasks: 42,
    deadline: "12/06/2026",
    members: ["https://picsum.photos/seed/user1/40/40", "https://picsum.photos/seed/user2/40/40", "https://picsum.photos/seed/user3/40/40"],
  },
  {
    id: "p2",
    name: "Admin Dashboard Redesign",
    code: "ADM",
    status: "At Risk",
    progress: 46,
    openTasks: 18,
    doneTasks: 20,
    deadline: "15/06/2026",
    members: ["https://picsum.photos/seed/user4/40/40", "https://picsum.photos/seed/user5/40/40"],
  },
  {
    id: "p3",
    name: "Mobile App Alpha",
    code: "MBA",
    status: "Almost Done",
    progress: 91,
    openTasks: 4,
    doneTasks: 53,
    deadline: "10/06/2026",
    members: ["https://picsum.photos/seed/user6/40/40", "https://picsum.photos/seed/user7/40/40", "https://picsum.photos/seed/user8/40/40"],
  },
  {
    id: "p4",
    name: "API Integration",
    code: "API",
    status: "On Track",
    progress: 62,
    openTasks: 8,
    doneTasks: 15,
    deadline: "20/06/2026",
    members: ["https://picsum.photos/seed/user9/40/40"],
  },
  {
    id: "p5",
    name: "Customer Support Portal",
    code: "CSP",
    status: "On Track",
    progress: 25,
    openTasks: 30,
    doneTasks: 10,
    deadline: "30/06/2026",
    members: ["https://picsum.photos/seed/user10/40/40", "https://picsum.photos/seed/user11/40/40"],
  }
];

export const chartData = [
  { name: 'Cần làm', value: 32, color: '#3B82F6' },
  { name: 'Đang làm', value: 18, color: '#8B5CF6' },
  { name: 'Hoàn thành', value: 54, color: '#10B981' },
  { name: 'Quá hạn', value: 9, color: '#EF4444' },
];

export const attentionItems = [
  {
    id: "a1",
    badge: "Overdue",
    text: "3 task quá hạn trong Admin Dashboard",
    color: "red"
  },
  {
    id: "a2",
    badge: "Deadline",
    text: "2 project sắp tới deadline trong 3 ngày",
    color: "amber"
  },
  {
    id: "a3",
    badge: "Unassigned",
    text: "5 task chưa assign người phụ trách",
    color: "blue"
  }
];

export const myTasks = [
  {
    id: "t1",
    title: "UI dashboard workspace redesign",
    priority: "High",
    status: "In Progress",
    deadline: "Hôm nay",
  },
  {
    id: "t2",
    title: "Fix create board popup issue",
    priority: "Medium",
    status: "Todo",
    deadline: "Ngày mai",
  },
  {
    id: "t3",
    title: "Connect stats with real API",
    priority: "Low",
    status: "Review",
    deadline: "12/06/2026",
  }
];

export const activities = [
  {
    id: "ac1",
    user: "Nass",
    avatar: "https://picsum.photos/seed/nass/40/40",
    action: "đã tạo task",
    target: "Thiết kế dashboard workspace",
    time: "10 phút trước",
    type: "create"
  },
  {
    id: "ac2",
    user: "Linh",
    avatar: "https://picsum.photos/seed/linh/40/40",
    action: "đã cập nhật status",
    target: "API create project",
    time: "32 phút trước",
    type: "update"
  },
  {
    id: "ac3",
    user: "Hoàng",
    avatar: "https://picsum.photos/seed/hoang/40/40",
    action: "đã comment vào",
    target: "Board view settings",
    time: "1 giờ trước",
    type: "comment"
  },
  {
    id: "ac4",
    user: "Trâm",
    avatar: "https://picsum.photos/seed/tram/40/40",
    action: "đã mời thành viên vào",
    target: "Workspace Frontend Team",
    time: "2 giờ trước",
    type: "invite"
  }
];

export const upcomingDeadlines = [
  {
    id: "d1",
    title: "Admin Dashboard Redesign",
    type: "project",
    deadline: "15/06/2026",
    daysRemaining: 6,
  },
  {
    id: "d2",
    title: "Mobile App Alpha Release",
    type: "project",
    deadline: "10/06/2026",
    daysRemaining: 1,
  },
  {
    id: "d3",
    title: "UI dashboard workspace",
    type: "task",
    deadline: "Hôm nay",
    daysRemaining: 0,
  }
];
