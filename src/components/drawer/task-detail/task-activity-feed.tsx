import { ActivityResponseDto, ActivityAction } from "@/services/activity/type";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Pencil,
  RefreshCcw,
  UserPlus,
  Trash2,
  ListTodo,
  AlertCircle,
  Calendar,
  Clock,
  UserMinus,
  MessageCircle,
  FolderKanban,
  CheckCircle2,
  Ban,
  Archive,
  ArrowRightLeft,
  LucideIcon,
  Activity as ActivityIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "./task-detail-utils";
import { Loader2 } from "lucide-react";

interface TaskActivityFeedProps {
  activities: ActivityResponseDto[];
  isLoading?: boolean;
}

const getActivityMeta = (action: ActivityAction): { text: string; icon: LucideIcon } => {
  const map: Record<ActivityAction, { text: string; icon: LucideIcon }> = {
    [ActivityAction.TASK_CREATED]: { text: "đã tạo task này", icon: Pencil },
    [ActivityAction.TASK_UPDATED]: { text: "đã cập nhật task", icon: RefreshCcw },
    [ActivityAction.TASK_DELETED]: { text: "đã xóa task", icon: Trash2 },
    [ActivityAction.TASK_RESTORED]: { text: "đã khôi phục task", icon: Archive },
    
    [ActivityAction.TASK_STATUS_CHANGED]: { text: "đã thay đổi trạng thái", icon: ListTodo },
    [ActivityAction.TASK_PRIORITY_CHANGED]: { text: "đã thay đổi độ ưu tiên", icon: AlertCircle },
    [ActivityAction.TASK_TITLE_CHANGED]: { text: "đã đổi tên task", icon: Pencil },
    [ActivityAction.TASK_DESCRIPTION_CHANGED]: { text: "đã cập nhật mô tả", icon: Pencil },
    [ActivityAction.TASK_DUE_DATE_CHANGED]: { text: "đã cập nhật ngày đến hạn", icon: Calendar },
    [ActivityAction.TASK_START_DATE_CHANGED]: { text: "đã cập nhật ngày bắt đầu", icon: Calendar },
    [ActivityAction.TASK_ESTIMATE_CHANGED]: { text: "đã cập nhật thời gian dự kiến", icon: Clock },
    
    [ActivityAction.TASK_ASSIGNED]: { text: "đã phân công task", icon: UserPlus },
    [ActivityAction.TASK_UNASSIGNED]: { text: "đã gỡ phân công", icon: UserMinus },
    
    [ActivityAction.TASK_MOVED_TO_SPRINT]: { text: "đã chuyển task vào sprint", icon: FolderKanban },
    [ActivityAction.TASK_REMOVED_FROM_SPRINT]: { text: "đã đưa task ra khỏi sprint", icon: FolderKanban },
    [ActivityAction.TASK_MOVED_TO_BACKLOG]: { text: "đã đưa task về backlog", icon: FolderKanban },
    
    [ActivityAction.SPRINT_CREATED]: { text: "đã tạo sprint", icon: FolderKanban },
    [ActivityAction.SPRINT_UPDATED]: { text: "đã cập nhật sprint", icon: RefreshCcw },
    [ActivityAction.SPRINT_STARTED]: { text: "đã bắt đầu sprint", icon: CheckCircle2 },
    [ActivityAction.SPRINT_COMPLETED]: { text: "đã hoàn thành sprint", icon: CheckCircle2 },
    [ActivityAction.SPRINT_CANCELLED]: { text: "đã hủy sprint", icon: Ban },
    [ActivityAction.SPRINT_DELETED]: { text: "đã xóa sprint", icon: Trash2 },
    [ActivityAction.SPRINT_RESTORED]: { text: "đã khôi phục sprint", icon: Archive },
    
    [ActivityAction.COMMENT_CREATED]: { text: "đã bình luận", icon: MessageCircle },
    [ActivityAction.COMMENT_UPDATED]: { text: "đã sửa bình luận", icon: MessageCircle },
    [ActivityAction.COMMENT_DELETED]: { text: "đã xóa bình luận", icon: Trash2 },

    [ActivityAction.WORKSPACE_MEMBER_JOINED]: { text: "đã tham gia workspace", icon: UserPlus },
    [ActivityAction.WORKSPACE_MEMBER_REMOVED]: { text: "đã rời workspace", icon: UserMinus },
    [ActivityAction.WORKSPACE_MEMBER_ROLE_CHANGED]: { text: "đã đổi vai trò", icon: ArrowRightLeft },

    [ActivityAction.PROJECT_CREATED]: { text: "đã tạo dự án", icon: FolderKanban },
    [ActivityAction.PROJECT_UPDATED]: { text: "đã cập nhật dự án", icon: RefreshCcw },
    [ActivityAction.PROJECT_DELETED]: { text: "đã xóa dự án", icon: Trash2 },
    [ActivityAction.PROJECT_RESTORED]: { text: "đã khôi phục dự án", icon: Archive },
  };

  return map[action] || { text: "đã thực hiện thay đổi", icon: ActivityIcon };
};

const isUUID = (str: string) => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
};

export function TaskActivityFeed({ activities, isLoading }: TaskActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-sm text-muted-foreground">
        Chưa có hoạt động nào cho task này.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => {
        const meta = getActivityMeta(activity.action);
        const Icon = meta.icon;

        const newValueString = activity.newValue ? String(activity.newValue) : "";
        const oldValueString = activity.oldValue ? String(activity.oldValue) : "";
        
        const showNewValue = !!activity.newValue && !isUUID(newValueString);
        const showOldValue = !!activity.oldValue && !isUUID(oldValueString);

        return (
          <div
            key={activity.id}
            className="group relative flex gap-4 transition-all duration-300"
          >
            {/* Connector line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-[-24px] w-[1px] bg-border" />
            )}

            <div className="relative">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={activity.actor?.avatarUrl || undefined} />
                <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                  {activity.actor ? getInitials(activity.actor.username || "") : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border text-muted-foreground">
                <Icon size={10} />
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <p className="text-sm text-foreground">
                <span className="font-semibold text-foreground">
                  {activity.actor?.username || "Hệ thống"}
                </span>{" "}
                <span className="text-muted-foreground">{meta.text}</span>
                {showNewValue && (
                  <span className="font-semibold text-foreground ml-1">
                    "{newValueString}"
                  </span>
                )}
                {showOldValue && (
                  <span className="text-muted-foreground ml-1 line-through text-xs">
                    (từ "{oldValueString}")
                  </span>
                )}
              </p>
              <span className="text-xs text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
