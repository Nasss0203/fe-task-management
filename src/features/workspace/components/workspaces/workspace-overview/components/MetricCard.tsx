import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  count: number;
  subText: string;
  icon: LucideIcon;
  link: string;
  tone: string;
}

export function MetricCard({ label, count, subText, icon: Icon, link, tone }: MetricCardProps) {
  const toneVariants: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    red: "text-red-600 dark:text-red-400",
    green: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Link 
      href={link}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate" title={label}>{label}</p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{count}</h3>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-transform duration-300 group-hover:scale-110">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      <p className="mt-3 text-[11px] font-medium text-muted-foreground truncate" title={subText}>
        {subText}
      </p>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
