"use client";

import React from "react";
import { SprintReport } from "@/services/sprint_report/type";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SprintVelocityChartProps {
  allReports: SprintReport[];
}

export const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({
  allReports,
}) => {
  // Sort reports chronologically by sprint name number, then by date
  const sortedReports = [...allReports].sort((a, b) => {
    const matchA = a.sprintName.match(/\d+/);
    const matchB = b.sprintName.match(/\d+/);
    if (matchA && matchB) {
      return parseInt(matchA[0], 10) - parseInt(matchB[0], 10);
    }
    const timeA = new Date(a.completedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.completedAt || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  const data = sortedReports.map((r) => ({
    name: r.sprintName,
    Total: r.totalTasks || 0,
    Completed: r.completedTasks || 0,
  }));

  if (data.length === 0) return null;

  return (
    <div className="w-full h-[450px] p-6 md:p-8 border border-border rounded-xl bg-card shadow-sm flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">Velocity Chart</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tracks total tasks (Total) vs actual completed tasks (Completed) across past sprints.
        </p>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 5,
            }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 13 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 13 }}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
              contentStyle={{ 
                borderRadius: "12px", 
                border: "1px solid var(--border)", 
                boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
                fontWeight: 500,
                padding: "12px 16px"
              }}
              itemStyle={{ padding: "4px 0" }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Total" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={40} opacity={0.6} />
            <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
