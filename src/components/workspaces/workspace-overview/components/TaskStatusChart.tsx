"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { WorkspaceOverviewTaskStatusItem } from "../workspace-overview.types";
import { getStatusFallbackColor } from "../workspace-overview.utils";

interface TaskStatusChartProps {
  workspaceSlug: string;
  total: number;
  items: WorkspaceOverviewTaskStatusItem[];
}

export function TaskStatusChart({ workspaceSlug, total, items }: TaskStatusChartProps) {
  const router = useRouter();

  const handleSegmentClick = (data: { statusId: string }) => {
    router.push(`/dashboard/${workspaceSlug}/tasks?statusId=${data.statusId}`);
  };

  const chartData = items.map((item, index) => ({
    ...item,
    value: item.count,
    color: item.color || getStatusFallbackColor(index)
  }));

  if (items.length === 0) {
    return (
      <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <h3 className="mb-4 text-sm font-semibold text-white">Trạng thái Task</h3>
        <p className="text-sm text-zinc-500 my-auto">Chưa có dữ liệu task</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="mb-4 text-sm font-semibold text-white">Trạng thái Task</h3>
      
      <div className="relative h-[220px] w-full" role="img" aria-label="Biểu đồ trạng thái task trong workspace">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              onClick={handleSegmentClick}
              className="cursor-pointer outline-none"
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="transition-opacity hover:opacity-80 stroke-zinc-900 stroke-2"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: 'transparent' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Tổng task</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
        {chartData.map((item) => (
          <div key={item.statusId} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-zinc-400 truncate">{item.name}</span>
            <span className="ml-auto text-[11px] font-bold text-white">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
