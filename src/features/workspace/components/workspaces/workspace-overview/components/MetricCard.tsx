import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  count: number;
  subText: string;
  icon: LucideIcon;
  tone: string;
}

export function MetricCard({ label, count, subText, icon: Icon, tone }: MetricCardProps) {
  const toneVariants: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    red: "text-red-600 dark:text-red-400",
    green: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate" title={label}>{label}</p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{count}</h3>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/60",
            toneVariants[tone] ?? "text-slate-700 dark:text-slate-300",
          )}
        >
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      <p className="mt-3 text-[11px] font-medium text-muted-foreground truncate" title={subText}>
        {subText}
      </p>
    </div>
  );
}
