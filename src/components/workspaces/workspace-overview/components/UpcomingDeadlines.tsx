import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { upcomingDeadlines } from "../workspace-overview.mock";

export function UpcomingDeadlines() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Deadline sắp tới</h3>
      <div className="space-y-4">
        {upcomingDeadlines.map((item) => (
          <div 
            key={item.id} 
            className={cn(
              "flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all",
              item.daysRemaining <= 2 && "border-red-500/20 bg-red-500/5 shadow-[0_0_15px_-5px_rgba(239,68,68,0.1)]"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                item.daysRemaining <= 2 ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-400"
              )}>
                {item.daysRemaining <= 2 ? <AlertTriangle size={18} /> : <Clock size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{item.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {item.type}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "text-xs font-bold",
                item.daysRemaining <= 2 ? "text-red-400" : "text-zinc-300"
              )}>
                {item.daysRemaining === 0 ? "Hôm nay" : `Còn ${item.daysRemaining} ngày`}
              </p>
              <p className="text-[10px] text-zinc-500">{item.deadline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
