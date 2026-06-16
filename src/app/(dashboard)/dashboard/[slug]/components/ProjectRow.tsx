import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/lib/mock-data";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProjectRowProps {
  project: Project;
  slug: string;
}

export const ProjectRow = ({ project, slug }: ProjectRowProps) => {
  const statusConfig = {
    'on-track': { label: 'Đúng tiến độ', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    'at-risk': { label: 'Có nguy cơ', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    'almost-done': { label: 'Sắp hoàn thành', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  };

  const status = statusConfig[project.status];

  return (
    <div className="group relative flex flex-col gap-4 py-4 px-4 transition-all hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-transparent hover:border-white/5">
      <div className="flex flex-1 items-center gap-4 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-muted-foreground font-semibold text-xs tracking-wider">
          {project.code}
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h4 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {project.name}
            </h4>
            <Badge variant="outline" className={`h-5 px-1.5 text-[10px] uppercase tracking-wider ${status.className}`}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <span className="text-foreground/80">{project.openTasks}</span> tác vụ mở
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-foreground/80">{project.doneTasks}</span> hoàn thành
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 opacity-50" />
              {project.deadline}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 lg:gap-12">
        <div className="w-full space-y-2 sm:w-32 lg:w-40">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-muted-foreground/60">Tiến độ</span>
            <span className="text-foreground/80">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5 bg-white/5" indicatorClassName="bg-indigo-500" />
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex -space-x-2 overflow-hidden">
            {project.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-[#111214]">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-zinc-800 text-[9px] font-bold text-white">
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#111214] bg-zinc-800 text-[9px] font-bold text-muted-foreground">
                +{project.members.length - 3}
              </div>
            )}
          </div>

          <Link href={`/dashboard/${slug}/projects/${project.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all active:scale-95">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
