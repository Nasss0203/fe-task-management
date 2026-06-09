"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserPlus, Briefcase } from "lucide-react";

export const QuickActions = () => {
  const actions = [
    { label: "Tạo task mới", icon: Plus, color: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 border-none" },
    { label: "Tạo project", icon: Briefcase, variant: "outline" as const, className: "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]" },
    { label: "Mời thành viên", icon: UserPlus, variant: "outline" as const, className: "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]" },
  ];

  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)] h-full">
      <CardHeader className="pt-8 px-8 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8 grid gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant || "default"}
            className={`h-11 rounded-2xl font-semibold transition-all active:scale-95 ${action.color || action.className}`}
            onClick={() => console.log(action.label)}
          >
            <action.icon className="mr-2.5 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
