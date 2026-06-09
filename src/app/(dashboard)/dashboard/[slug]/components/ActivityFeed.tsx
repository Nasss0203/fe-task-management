"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/lib/mock-data";
import { MessageCircle, Pencil, RefreshCcw, UserPlus } from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const iconConfig = {
    create: { icon: Pencil, color: "text-blue-400", bg: "bg-blue-500/10" },
    update: { icon: RefreshCcw, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    comment: { icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    invite: { icon: UserPlus, color: "text-purple-400", bg: "bg-purple-500/10" },
  };

  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)] h-full">
      <CardHeader className="pt-8 px-8 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-white/5 shadow-sm mb-4">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Chưa có hoạt động</p>
            <p className="text-xs text-muted-foreground mt-1">Các hoạt động mới nhất sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-[19px] before:w-[1px] before:bg-white/5">
            {activities.map((activity) => {
              const config = iconConfig[activity.type];
              const Icon = config.icon;
              return (
                <div key={activity.id} className="relative flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-white/5 shadow-sm">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="bg-zinc-800 text-[10px] font-bold text-white">
                        {activity.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-900 ${config.bg} ${config.color}`}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 py-1">
                    <p className="text-[13px] leading-snug text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {activity.user.name}
                      </span>{" "}
                      {activity.action}{" "}
                      <span className="font-semibold text-foreground">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground/40">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
