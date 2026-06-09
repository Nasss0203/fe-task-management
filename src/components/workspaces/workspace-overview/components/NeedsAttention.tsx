import Link from "next/link";
import { AlertCircle, Clock, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { attentionItems } from "../workspace-overview.mock";

interface NeedsAttentionProps {
  workspaceSlug: string;
}

export function NeedsAttention({ workspaceSlug }: NeedsAttentionProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "Overdue":
        return AlertCircle;
      case "Deadline":
        return Clock;
      case "Unassigned":
        return UserPlus;
      default:
        return AlertCircle;
    }
  };

  const getStyles = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-400 bg-red-400/5 hover:bg-red-400/10 border-red-400/10";
      case "amber":
        return "text-amber-400 bg-amber-400/5 hover:bg-amber-400/10 border-amber-400/10";
      case "blue":
        return "text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 border-blue-400/10";
      default:
        return "text-zinc-400 bg-zinc-400/5 hover:bg-zinc-400/10 border-zinc-400/10";
    }
  };

  const getLink = (type: string) => {
    switch (type) {
      case "Overdue":
        return `/dashboard/${workspaceSlug}/tasks?filter=overdue`;
      case "Deadline":
        return `/dashboard/${workspaceSlug}/projects`;
      case "Unassigned":
        return `/dashboard/${workspaceSlug}/tasks?filter=unassigned`;
      default:
        return "#";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Cần chú ý</h3>
      <div className="space-y-3">
        {attentionItems.map((item) => {
          const Icon = getIcon(item.badge);
          return (
            <Link 
              key={item.id}
              href={getLink(item.badge)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                getStyles(item.color)
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-current/10">
                <Icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {item.badge}
                </span>
                <span className="text-sm font-medium text-white">
                  {item.text}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
