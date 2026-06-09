export interface MetricData {
  count: number;
  change?: string;
  sub?: string;
  active?: number;
}

export interface Metrics {
  projects: MetricData;
  openTasks: MetricData;
  overdue: MetricData;
  members: MetricData;
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: 'on-track' | 'at-risk' | 'almost-done';
  progress: number;
  openTasks: number;
  doneTasks: number;
  deadline: string;
  members: ProjectMember[];
}

export interface TaskStatus {
  name: string;
  value: number;
  color: string;
}

export interface WarningItem {
  id: string;
  badge: string;
  type: 'overdue' | 'deadline' | 'unassigned';
  text: string;
  link: string;
}

export interface MyTask {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Review' | 'Overdue';
  deadline: string;
  link: string;
}

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  time: string;
  type: 'create' | 'update' | 'comment' | 'invite';
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  type: 'project' | 'task';
  deadline: string;
  daysLeft: number;
}

export const metrics: Metrics = {
  projects: { count: 12, change: '+2 trong tuần này' },
  openTasks: { count: 148, sub: '26 task cần xử lý' },
  overdue: { count: 9, sub: 'Cần ưu tiên hôm nay' },
  members: { count: 23, active: 5 },
};

export const projects: Project[] = [
  {
    id: '1',
    name: 'Task Management Web',
    code: 'TMW',
    status: 'on-track',
    progress: 78,
    openTasks: 12,
    doneTasks: 42,
    deadline: '12/06/2026',
    members: [
      { id: '1', name: 'Nass' },
      { id: '2', name: 'Linh' },
      { id: '3', name: 'Hoàng' },
    ],
  },
  {
    id: '2',
    name: 'Admin Dashboard',
    code: 'ADM',
    status: 'at-risk',
    progress: 46,
    openTasks: 18,
    doneTasks: 20,
    deadline: '06/06/2026',
    members: [
      { id: '1', name: 'Nass' },
      { id: '4', name: 'Trâm' },
      { id: '5', name: 'Quân' },
    ],
  },
  {
    id: '3',
    name: 'Mobile App',
    code: 'MBA',
    status: 'almost-done',
    progress: 91,
    openTasks: 4,
    doneTasks: 53,
    deadline: '20/06/2026',
    members: [
      { id: '3', name: 'Hoàng' },
      { id: '2', name: 'Linh' },
    ],
  },
];

export const taskStatus: TaskStatus[] = [
  { name: 'Cần làm', value: 32, color: '#3B82F6' },
  { name: 'Đang làm', value: 18, color: '#8B5CF6' },
  { name: 'Hoàn thành', value: 54, color: '#10B981' },
  { name: 'Quá hạn', value: 9, color: '#EF4444' },
];

export const needsAttention: WarningItem[] = [
  {
    id: '1',
    badge: 'Overdue',
    type: 'overdue',
    text: '3 task quá hạn trong Admin Dashboard',
    link: '/tasks?filter=overdue',
  },
  {
    id: '2',
    badge: 'Deadline',
    type: 'deadline',
    text: '2 project sắp tới deadline trong 3 ngày',
    link: '/projects?filter=upcoming',
  },
  {
    id: '3',
    badge: 'Unassigned',
    type: 'unassigned',
    text: '5 task chưa assign người phụ trách',
    link: '/tasks?filter=unassigned',
  },
];

export const myTasks: MyTask[] = [
  {
    id: '1',
    title: 'Thiết kế dashboard workspace',
    priority: 'High',
    status: 'In Progress',
    deadline: '10/06/2026',
    link: '/tasks/1',
  },
  {
    id: '2',
    title: 'API create project',
    priority: 'Medium',
    status: 'Todo',
    deadline: '12/06/2026',
    link: '/tasks/2',
  },
  {
    id: '3',
    title: 'Fix bug login social',
    priority: 'High',
    status: 'Review',
    deadline: '09/06/2026',
    link: '/tasks/3',
  },
];

export const activities: Activity[] = [
  {
    id: '1',
    user: { name: 'Nass' },
    action: 'đã tạo task',
    target: 'Thiết kế dashboard workspace',
    time: '10 phút trước',
    type: 'create',
  },
  {
    id: '2',
    user: { name: 'Linh' },
    action: 'đã cập nhật status',
    target: 'API create project',
    time: '32 phút trước',
    type: 'update',
  },
  {
    id: '3',
    user: { name: 'Hoàng' },
    action: 'đã comment vào',
    target: 'Board view settings',
    time: '1 giờ trước',
    type: 'comment',
  },
  {
    id: '4',
    user: { name: 'Trâm' },
    action: 'đã mời thành viên vào',
    target: 'Workspace Frontend Team',
    time: '2 giờ trước',
    type: 'invite',
  },
];

export const upcomingDeadlines: UpcomingDeadline[] = [
  {
    id: '1',
    title: 'Admin Dashboard',
    type: 'project',
    deadline: '10/06/2026',
    daysLeft: 1,
  },
  {
    id: '2',
    title: 'API Billing Plan',
    type: 'task',
    deadline: '12/06/2026',
    daysLeft: 3,
  },
];
