import { Pencil, MessageCircle, RefreshCcw, UserPlus } from "lucide-react";
import { activities } from "../workspace-overview.mock";

export function ActivityFeed() {
  const getIcon = (type: string) => {
    switch (type) {
      case "create":
        return Pencil;
      case "comment":
        return MessageCircle;
      case "update":
        return RefreshCcw;
      case "invite":
        return UserPlus;
      default:
        return RefreshCcw;
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="mb-6 text-lg font-semibold text-white">Hoạt động gần đây</h3>
      <div className="space-y-6">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="relative flex gap-4">
              {/* Connector line */}
              <div className="absolute left-[19px] top-10 bottom-[-24px] w-[1px] bg-zinc-800 last:hidden" />
              
              <div className="relative">
                <img 
                  src={activity.avatar} 
                  alt={activity.user} 
                  className="h-10 w-10 rounded-full border-2 border-zinc-800 object-cover"
                />
                <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  <Icon size={10} />
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-0.5">
                <p className="text-sm text-zinc-300">
                  <span className="font-bold text-white">{activity.user}</span>
                  {" "}{activity.action}{" "}
                  <span className="font-bold text-white">{activity.target}</span>
                </p>
                <span className="text-xs text-zinc-500">{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
