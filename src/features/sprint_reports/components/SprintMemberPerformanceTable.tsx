"use client";

import React from "react";
import { SprintReport } from "@/services/sprint_report/type";
import { TrendingUp } from "lucide-react";

interface Props {
  memberPerformance: SprintReport["memberPerformance"];
}

export const SprintMemberPerformanceTable: React.FC<Props> = ({ memberPerformance }) => {
  if (!memberPerformance || memberPerformance.length === 0) return null;

  const calculatePercentage = (completed: number, incomplete: number) => {
    const total = completed + incomplete;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden relative">
      <div className="relative p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">Member Performance</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Hiệu suất làm việc của từng thành viên trong sprint</p>
          </div>
        </div>

        <div className="max-h-[450px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-4 px-4 font-medium text-muted-foreground text-sm">Thành viên</th>
                  <th className="py-4 px-4 font-medium text-muted-foreground text-sm text-center">Task xong</th>
                  <th className="py-4 px-4 font-medium text-muted-foreground text-sm text-center">Task tồn</th>
                  <th className="py-4 px-4 font-medium text-muted-foreground text-sm text-right">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {memberPerformance.map((perf) => {
                  const percentage = calculatePercentage(perf.completedTasks, perf.incompleteTasks);
                  
                  // Generate a random gradient based on user name length or char code for avatar background
                  const avatarColorIndex = (perf.assigneeName?.charCodeAt(0) || 0) % 3;
                  const avatarGradients = [
                    "from-blue-100 to-indigo-100 text-blue-700",
                    "from-emerald-100 to-teal-100 text-emerald-700",
                    "from-orange-100 to-rose-100 text-orange-700"
                  ];
                  const bgGradient = avatarGradients[avatarColorIndex];

                  return (
                    <tr 
                      key={perf.assigneeId} 
                      className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {perf.avatar ? (
                              <img src={perf.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-border shadow-sm" />
                            ) : (
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center font-bold shadow-sm border border-border/50 text-sm`}>
                                {(perf.assigneeName || "U").substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-foreground text-base">{perf.assigneeName || "Unknown User"}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-emerald-500 text-base">{perf.completedTasks}</span>
                      </td>
                      
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-rose-400 text-base">{perf.incompleteTasks}</span>
                      </td>
                      
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end">
                          <div className={`px-2.5 py-1 rounded-md text-xs font-bold w-fit ${
                            percentage >= 80 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : percentage >= 50 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {percentage}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
