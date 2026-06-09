import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { myTasks } from "../workspace-overview.mock";

interface MyTasksProps {
  workspaceSlug: string;
}

export function MyTasks({ workspaceSlug }: MyTasksProps) {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-blue-500";
      default:
        return "text-zinc-500";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Todo":
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      case "Review":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Task của tôi</h3>
        <Link 
          href={`/dashboard/${workspaceSlug}/tasks?assignee=me`}
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {myTasks.map((task) => (
          <Link 
            key={task.id}
            href={`/dashboard/${workspaceSlug}/tasks/${task.id}`}
            className="group flex flex-col gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-800/40"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                {task.title}
              </h4>
              <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
            </div>

            <div className="flex items-center gap-3">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", getPriorityStyles(task.priority))}>
                {task.priority}
              </span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border", getStatusStyles(task.status))}>
                {task.status}
              </span>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Calendar size={12} />
                <span>{task.deadline}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
