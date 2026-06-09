import { 
  FolderKanban, 
  FileText, 
  AlertCircle, 
  Users,
  Pencil,
  RefreshCcw,
  UserPlus,
  MessageCircle,
  LucideIcon
} from "lucide-react";
import { 
  WorkspaceOverviewApiData, 
  WorkspaceOverviewAttentionItem
} from "./workspace-overview.types";

export const getMetricCards = (data: WorkspaceOverviewApiData, workspaceSlug: string) => [
  {
    key: 'projects',
    label: 'Dự án',
    count: data.metrics.projects.count,
    subText: `+${data.metrics.projects.newThisWeek} trong tuần này`,
    icon: FolderKanban,
    href: `/dashboard/${workspaceSlug}/projects`,
    tone: 'blue',
  },
  {
    key: 'openTasks',
    label: 'Task đang mở',
    count: data.metrics.openTasks.count,
    subText: `${data.metrics.openTasks.assignedToMe} task của bạn`,
    icon: FileText,
    href: `/dashboard/${workspaceSlug}/tasks?status=open`,
    tone: 'purple',
  },
  {
    key: 'overdueTasks',
    label: 'Quá hạn',
    count: data.metrics.overdueTasks.count,
    subText: `${data.metrics.overdueTasks.assignedToMe} task của bạn`,
    icon: AlertCircle,
    href: `/dashboard/${workspaceSlug}/tasks?filter=overdue`,
    tone: 'red',
  },
  {
    key: 'members',
    label: 'Thành viên',
    count: data.metrics.members.count,
    subText: `${data.metrics.members.activeRecently} người hoạt động gần đây`,
    icon: Users,
    href: `/dashboard/${workspaceSlug}/members`,
    tone: 'green',
  },
];

export const getProjectHealthMeta = (health: string) => {
  const meta: Record<string, { label: string; className: string }> = {
    'on-track': {
      label: 'On Track',
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    'at-risk': {
      label: 'At Risk',
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    'almost-done': {
      label: 'Almost Done',
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
  };
  return meta[health] || { label: health, className: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
};

export const getAttentionMeta = (item: WorkspaceOverviewAttentionItem, workspaceSlug: string) => {
  const meta: Record<string, { badge: string; tone: string; buildText: (item: WorkspaceOverviewAttentionItem) => string; href: string }> = {
    overdue: {
      badge: 'Overdue',
      tone: 'red',
      buildText: (item) => `${item.count} task quá hạn${item.projectName ? ` trong ${item.projectName}` : ''}`,
      href: `/dashboard/${workspaceSlug}/tasks?filter=overdue`,
    },
    'deadline-soon': {
      badge: 'Deadline',
      tone: 'amber',
      buildText: (item) => `${item.count} deadline sắp tới${item.projectName ? ` trong ${item.projectName}` : ''}`,
      href: `/dashboard/${workspaceSlug}/projects`,
    },
    unassigned: {
      badge: 'Unassigned',
      tone: 'blue',
      buildText: (item) => `${item.count} task chưa assign người phụ trách`,
      href: `/dashboard/${workspaceSlug}/tasks?filter=unassigned`,
    },
  };
  return meta[item.type];
};

export const getActivityMeta = (action: string): { text: string; icon: LucideIcon } => {
  const activityActionText: Record<string, string> = {
    TASK_CREATED: 'đã tạo task',
    TASK_UPDATED: 'đã cập nhật task',
    TASK_ASSIGNED: 'đã assign task',
    TASK_STATUS_UPDATED: 'đã cập nhật trạng thái',
    TASK_COMMENTED: 'đã bình luận vào',
    MEMBER_INVITED: 'đã mời thành viên vào',
    PROJECT_CREATED: 'đã tạo project',
  };

  const activityIcons: Record<string, LucideIcon> = {
    TASK_CREATED: Pencil,
    TASK_UPDATED: RefreshCcw,
    TASK_ASSIGNED: UserPlus,
    TASK_STATUS_UPDATED: RefreshCcw,
    TASK_COMMENTED: MessageCircle,
    MEMBER_INVITED: UserPlus,
    PROJECT_CREATED: FolderKanban,
  };

  return {
    text: activityActionText[action] || action,
    icon: activityIcons[action] || RefreshCcw,
  };
};
