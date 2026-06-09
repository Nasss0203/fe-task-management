import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/lib/mock-data";
import { ProjectRow } from "./ProjectRow";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface ProjectOverviewProps {
  projects: Project[];
  slug: string;
}

export const ProjectOverview = ({ projects, slug }: ProjectOverviewProps) => {
  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)] h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8 pt-8 px-8">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Dự án đang triển khai</CardTitle>
        <Link
          href={`/dashboard/${slug}/projects`}
          className="group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-indigo-400 transition-colors"
        >
          Xem tất cả
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {projects.length === 0 ? (
          <EmptyState
            title="Chưa có dự án nào"
            description="Hãy bắt đầu bằng cách tạo dự án đầu tiên của bạn."
          />
        ) : (
          <div className="flex flex-col gap-1">
            {projects.slice(0, 5).map((project, i) => (
              <div 
                key={project.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ProjectRow project={project} slug={slug} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
