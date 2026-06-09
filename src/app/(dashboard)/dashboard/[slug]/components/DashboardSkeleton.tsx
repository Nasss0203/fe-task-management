import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="flex-1 space-y-10 pb-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 opacity-50" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl bg-zinc-900/50" />
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-8">
          <Skeleton className="h-[500px] w-full rounded-3xl bg-zinc-900/50" />
          <div className="grid grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full rounded-3xl bg-zinc-900/50" />
            <Skeleton className="h-[400px] w-full rounded-3xl bg-zinc-900/50" />
          </div>
        </div>

        <div className="space-y-8">
          <Skeleton className="h-[400px] w-full rounded-3xl bg-zinc-900/50" />
          <Skeleton className="h-[300px] w-full rounded-3xl bg-zinc-900/50" />
          <Skeleton className="h-[250px] w-full rounded-3xl bg-zinc-900/50" />
        </div>
      </div>
    </div>
  );
};
