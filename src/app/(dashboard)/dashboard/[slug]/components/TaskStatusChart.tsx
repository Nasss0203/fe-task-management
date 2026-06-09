"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface TaskStatusChartProps {
  data: TaskStatus[];
  slug: string;
}

export const TaskStatusChart = ({ data, slug }: TaskStatusChartProps) => {
  const router = useRouter();
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const handleClick = (entry: TaskStatus) => {
    const statusMap: Record<string, string> = {
      'Cần làm': 'todo',
      'Đang làm': 'in-progress',
      'Hoàn thành': 'done',
      'Quá hạn': 'overdue',
    };
    router.push(`/dashboard/${slug}/tasks?status=${statusMap[entry.name] || 'all'}`);
  };

  return (
    <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-2 pt-8 px-8">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Trạng thái Task</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div
          className="h-[240px] w-full"
          role="img"
          aria-label="Biểu đồ trạng thái task trong workspace"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                onClick={(entry) => handleClick(entry)}
                className="outline-none"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "#ffffff" }}
                cursor={{ fill: "transparent" }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-3xl font-bold tracking-tighter"
              >
                {total}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between group cursor-pointer" onClick={() => handleClick(entry)}>
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] opacity-80"
                  style={{ backgroundColor: entry.color, color: entry.color }}
                />
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{entry.name}</span>
              </div>
              <span className="text-[13px] font-semibold text-foreground/80">
                {entry.value} <span className="text-[11px] font-normal text-muted-foreground/40 ml-1">({Math.round((entry.value / total) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
