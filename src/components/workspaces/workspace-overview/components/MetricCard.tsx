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
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  return (
    <Link 
      href={link}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
        tone === 'red' && "border-red-900/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{count}</h3>
        </div>
        <div className={cn("rounded-lg border p-2.5 transition-colors duration-300", toneVariants[tone])}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-[12px] font-medium text-muted-foreground">
        {subText}
      </p>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
