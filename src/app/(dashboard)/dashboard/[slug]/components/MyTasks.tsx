import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyTask } from "@/lib/mock-data";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";


interface MyTasksProps {
  tasks: MyTask[];
  slug: string;
}

export const MyTasks = ({ tasks, slug }: MyTasksProps) => {
  const priorityConfig = {
    High: "bg-red-500/10 text-red-500 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  const statusConfig = {
    Todo: "bg-zinc-800 text-zinc-400 border-white/5",
    "In Progress": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Overdue: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-8 px-8">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Task của tôi</CardTitle>
        <Link
          href={`/dashboard/${slug}/tasks?assignee=me`}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-indigo-400 transition-colors"
        >
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-white/5 shadow-sm mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Không có task nào</p>
            <p className="text-xs text-muted-foreground mt-1">Bạn hiện không có task nào được giao.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/${slug}${task.link}`}
                className="group block rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition-all hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <h4 className="text-[14px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors leading-tight">
                      {task.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider h-5 px-1.5 ${priorityConfig[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider h-5 px-1.5 ${statusConfig[task.status]}`}>
                        {task.status}
                      </Badge>
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/50">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {task.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
