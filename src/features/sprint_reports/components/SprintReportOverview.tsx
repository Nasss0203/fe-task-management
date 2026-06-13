"use client";

import { SprintReport } from "@/services/sprint_report/type";
import React from "react";
import { SprintVelocityChart } from "./SprintVelocityChart";
import { SprintMemberPerformanceTable } from "./SprintMemberPerformanceTable";
import { SprintTaskListTable } from "./SprintTaskListTable";

interface SprintReportOverviewProps {
  report: SprintReport;
  allReports: SprintReport[];
}

export const SprintReportOverview: React.FC<SprintReportOverviewProps> = ({ report, allReports }) => {
  const formatPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const taskProgress = formatPercentage(report.completedTasks, report.totalTasks);

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="relative p-8 md:p-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit mb-2">
                Sprint Report
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{report.sprintName}</h2>
              {report.sprintGoal ? (
                <p className="text-lg text-muted-foreground mt-1 max-w-2xl">{report.sprintGoal}</p>
              ) : (
                <p className="text-lg text-muted-foreground mt-1 max-w-2xl italic">Không có mục tiêu nào được đặt cho sprint này.</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                <svg className="w-5 h-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Started</span>
                <span className="font-medium text-foreground">
                  {report.startAt ? new Date(report.startAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </span>
              </div>
            </div>
            
            <div className="w-px h-8 bg-border hidden sm:block" />
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
                <span className="font-medium text-foreground">
                  {report.completedAt ? new Date(report.completedAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-border/80">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Total Tasks</div>
          <div className="flex items-end gap-2">
            <div className="text-5xl font-black text-foreground tracking-tighter">{report.totalTasks}</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Completed Tasks</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-end gap-2">
              <div className="text-5xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter">{report.completedTasks}</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${taskProgress}%` }} />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">{taskProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <SprintMemberPerformanceTable memberPerformance={report.memberPerformance} />
        <SprintTaskListTable 
          completedTasks={report.completedTaskDetails} 
          incompleteTasks={report.incompleteTaskDetails} 
        />
        <SprintVelocityChart allReports={allReports} />
      </div>
    </div>
  );
};
