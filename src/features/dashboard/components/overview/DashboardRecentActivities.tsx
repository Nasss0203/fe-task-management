import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import type { DashboardActivityResponseDto } from "@/services/dashboard/type";

const DashboardActivityItem = dynamic(
	() =>
		import("@/features/dashboard/components/overview/DashboardActivityItem").then(
			(mod) => mod.DashboardActivityItem,
		),
	{ ssr: false, loading: () => <Skeleton className="h-[64px] w-full rounded-xl" /> },
);

type DashboardRecentActivitiesProps = {
	recentActivities: DashboardActivityResponseDto[];
};

export function DashboardRecentActivities({ recentActivities }: DashboardRecentActivitiesProps) {
	return (
		<Card className='xl:col-span-8'>
			<CardHeader>
				<CardTitle>Hoạt động gần đây</CardTitle>
				<CardDescription>
					Các thay đổi mới nhất có liên quan trực tiếp đến bạn.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{recentActivities.length ? (
					<div className='flex flex-col [content-visibility:auto] [contain-intrinsic-size:500px]'>
						{recentActivities.map((activity, index) => (
							<DashboardActivityItem
								key={activity.id}
								activity={activity}
								isLast={index === recentActivities.length - 1}
							/>
						))}
					</div>
				) : (
					<EmptyState>Chưa có hoạt động gần đây.</EmptyState>
				)}
			</CardContent>
		</Card>
	);
}
