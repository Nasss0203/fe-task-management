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
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Stacks components tightly vertically */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Header & Stats Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-semibold text-foreground w-fit mb-3">
                  Sprint Report
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">{report.sprintName}</h2>
                {report.sprintGoal ? (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">{report.sprintGoal}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1 italic">Không có mục tiêu nào được đặt cho sprint này.</p>
                )}
              </div>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
                <div className="bg-secondary/40 rounded-xl p-4 flex-1 sm:w-32 flex flex-col justify-center">
                  <div className="text-xs font-medium text-muted-foreground">Total Tasks</div>
                  <div className="text-3xl font-bold text-foreground mt-2">{report.totalTasks}</div>
                </div>
                <div className="bg-secondary/40 rounded-xl p-4 flex-1 sm:w-40 flex flex-col justify-center">
                  <div className="text-xs font-medium text-muted-foreground">Completed</div>
                  <div className="text-3xl font-bold text-emerald-500 mt-2">{report.completedTasks}</div>
                  <div className="text-xs text-muted-foreground mt-2">{taskProgress}% hoàn thành</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mt-8 pt-6 border-t border-border">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground mb-1">Started</span>
                <span className="text-sm font-semibold text-foreground">
                  {report.startAt ? new Date(report.startAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground mb-1">Completed</span>
                <span className="text-sm font-semibold text-foreground">
                  {report.completedAt ? new Date(report.completedAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <SprintTaskListTable 
            completedTasks={report.completedTaskDetails} 
            incompleteTasks={report.incompleteTaskDetails} 
          />
          <SprintMemberPerformanceTable memberPerformance={report.memberPerformance} />
        </div>

        {/* Right Column: Stacks components tightly vertically */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Sprint progress</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-emerald-500">{report.completedTasks}</span>
              <span className="text-lg font-medium text-muted-foreground">/ {report.totalTasks} tasks</span>
            </div>
            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${taskProgress}%` }} />
            </div>
          </div>

          <SprintVelocityChart allReports={allReports} />
        </div>
      </div>

    </div>
  );
};
