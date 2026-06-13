"use client";

import React, { useState } from "react";
import { SprintReport } from "@/services/sprint_report/type";
import { CheckCircle2, Circle, ListTodo, MoreHorizontal } from "lucide-react";

interface Props {
  completedTasks: SprintReport["completedTaskDetails"];
  incompleteTasks: SprintReport["incompleteTaskDetails"];
}

export const SprintTaskListTable: React.FC<Props> = ({ completedTasks, incompleteTasks }) => {
  const [activeTab, setActiveTab] = useState<"completed" | "incomplete">("completed");

  const tasksToDisplay = activeTab === "completed" ? completedTasks : incompleteTasks;

  if (!completedTasks && !incompleteTasks) return null;

  return (
    <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
      
      <div className="relative p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-foreground tracking-tight">Chi tiết Tasks</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Danh sách công việc trong sprint</p>
            </div>
          </div>
          
          <div className="inline-flex bg-secondary/50 p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("completed")}
              className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === "completed" 
                  ? "text-emerald-700 dark:text-emerald-400 shadow-sm bg-background border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                Hoàn thành
                <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted-foreground/10"}`}>
                  {completedTasks?.length || 0}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("incomplete")}
              className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === "incomplete" 
                  ? "text-amber-700 dark:text-amber-400 shadow-sm bg-background border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                Chưa xong
                <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === "incomplete" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted-foreground/10"}`}>
                  {incompleteTasks?.length || 0}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {tasksToDisplay && tasksToDisplay.length > 0 ? (
            tasksToDisplay.map((task) => (
              <div 
                key={task.id} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-card hover:border-border hover:shadow-sm transition-all duration-200 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {activeTab === "completed" ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                        <Circle size={20} className="text-amber-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-background px-2 py-0.5 rounded-md border border-border/50">TSK-{task.projectSeq}</span>
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-bold border border-primary/20">
                        {task.estimateMinutes} points
                      </span>
                    </div>
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-base line-clamp-1">{task.title}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                  <div className="flex -space-x-2 overflow-hidden ml-14 sm:ml-0">
                    {task.assignees?.map((assignee, idx) => {
                      const avatarColorIndex = (assignee.name?.charCodeAt(0) || 0) % 3;
                      const avatarGradients = [
                        "from-blue-500 to-indigo-500",
                        "from-emerald-400 to-teal-500",
                        "from-orange-400 to-rose-500"
                      ];
                      const bgGradient = avatarGradients[avatarColorIndex];

                      return (
                        <div 
                          key={assignee.userId || idx} 
                          className="inline-block h-8 w-8 rounded-full border-2 border-background shadow-sm flex items-center justify-center text-[10px] font-bold z-10"
                          title={assignee.name || "Unknown User"}
                        >
                          {assignee.avatar ? (
                            <img src={assignee.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center`}>
                              {(assignee.name || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <button className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors shrink-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl bg-secondary/20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ListTodo className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1">Không có dữ liệu</h4>
              <p className="text-sm text-muted-foreground max-w-sm text-center">
                Không có task nào trong danh mục này.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
