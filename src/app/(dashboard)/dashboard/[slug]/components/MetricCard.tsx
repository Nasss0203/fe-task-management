import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  href: string;
  highlight?: boolean;
}

export const MetricCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  highlight,
}: MetricCardProps) => {
  return (
    <Link
      href={href}
      className="block group outline-none"
      aria-label={`${label}: ${value}`}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:-translate-y-1 border-white/5 bg-zinc-900/50 backdrop-blur-sm",
          "shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]",
          highlight && "border-red-500/20 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.05)]"
        )}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-semibold tracking-tighter text-foreground">
                {value}
              </h2>
            </div>
            {subtext && (
              <p className={cn("text-[11px] font-medium text-muted-foreground/60", highlight && "text-red-400/60")}>
                {subtext}
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors",
              highlight && "bg-red-500/10 text-red-400 border-red-500/10 group-hover:bg-red-500/20"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        </CardContent>
        {highlight && (
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        )}
      </Card>
    </Link>
  );
};
