import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  count: number;
  subText: string;
  icon: LucideIcon;
  link: string;
  color: string;
}

export function MetricCard({ label, count, subText, icon: Icon, link, color }: MetricCardProps) {
  const colorVariants: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  return (
    <Link 
      href={link}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:bg-zinc-800/80 hover:ring-2 hover:ring-zinc-700/50",
        color === 'red' && "border-red-900/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">{label}</p>
          <h3 className="mt-1 text-3xl font-bold tracking-tight text-white">{count}</h3>
        </div>
        <div className={cn("rounded-lg border p-2.5 transition-colors duration-300", colorVariants[color])}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-400">
        {subText}
      </p>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
