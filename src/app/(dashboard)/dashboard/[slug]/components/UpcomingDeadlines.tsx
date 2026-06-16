import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingDeadline } from "@/lib/mock-data";
import { Calendar, AlertTriangle } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[];
}

export const UpcomingDeadlines = ({ deadlines }: UpcomingDeadlinesProps) => {
  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)] h-full">
      <CardHeader className="pt-8 px-8 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Hạn chót sắp tới</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {deadlines.length === 0 ? (
          <EmptyState title="Không có hạn chót" description="Không có hạn chót nào trong 7 ngày tới." />
        ) : (
          <div className="space-y-3">
            {deadlines.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] p-3.5"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/5 transition-colors ${item.daysLeft <= 2 ? 'text-red-400 bg-red-500/10 border-red-500/10' : 'text-muted-foreground'}`}>
                    {item.daysLeft <= 2 ? <AlertTriangle className="h-4.5 w-4.5" /> : <Calendar className="h-4.5 w-4.5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-semibold text-foreground/90 truncate max-w-[140px]">
                      {item.title}
                    </p>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-[0.1em] h-4.5 px-1.5 opacity-50">
                      {item.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <p className={`text-[12px] font-bold ${item.daysLeft <= 2 ? 'text-red-400' : 'text-foreground/80'}`}>
                    Trong {item.daysLeft} ngày
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground/40">{item.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
