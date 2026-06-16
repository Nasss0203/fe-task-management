import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Briefcase } from "lucide-react";

interface DashboardHeaderProps {
  workspaceName: string;
  description: string;
}

export const DashboardHeader = ({
  workspaceName,
  description,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <Avatar className="h-16 w-16 rounded-[22px] border border-white/10 shadow-2xl transition-transform group-hover:scale-105 group-hover:rotate-3 duration-500">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white tracking-tighter">
              {workspaceName.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-sm" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {workspaceName}
          </h1>
          <p className="text-[13px] font-medium text-muted-foreground/60 max-w-md leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="h-10 rounded-2xl border-white/5 bg-white/[0.02] px-4 font-semibold text-foreground/80 hover:bg-white/[0.05] hover:text-foreground transition-all active:scale-95">
          <Briefcase className="mr-2 h-3.5 w-3.5 text-muted-foreground/60" />
          Tạo dự án
        </Button>
        <Button variant="outline" size="sm" className="h-10 rounded-2xl border-white/5 bg-white/[0.02] px-4 font-semibold text-foreground/80 hover:bg-white/[0.05] hover:text-foreground transition-all active:scale-95">
          <UserPlus className="mr-2 h-3.5 w-3.5 text-muted-foreground/60" />
          Mời thành viên
        </Button>
        <Button size="sm" className="h-10 rounded-2xl bg-indigo-500 px-5 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 border-none transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Tạo tác vụ mới
        </Button>
      </div>
    </div>
  );
};
