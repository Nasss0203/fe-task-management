"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DashboardFocus } from "@/features/dashboard/components/overview/DashboardFocus";
import { DashboardHeader } from "@/features/dashboard/components/overview/DashboardHeader";
import { DashboardPriorityTasks } from "@/features/dashboard/components/overview/DashboardPriorityTasks";
import { DashboardRecentActivities } from "@/features/dashboard/components/overview/DashboardRecentActivities";
import { DashboardRecentDeadlines } from "@/features/dashboard/components/overview/DashboardRecentDeadlines";
import { DashboardRecentWorkspaces } from "@/features/dashboard/components/overview/DashboardRecentWorkspaces";
import { DashboardStats } from "@/features/dashboard/components/overview/DashboardStats";
import { DashboardSuggestions } from "@/features/dashboard/components/overview/DashboardSuggestions";
import { LoadingDashboard } from "@/features/dashboard/components/overview/LoadingDashboard";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import {
	getClientTimezone,
	toLocalDateInputValue,
} from "@/features/dashboard/utils/date";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
	const timezone = getClientTimezone();

	const query = useMemo(
		() => ({
			date: toLocalDateInputValue(),
			timezone,
			limit: 5,
		}),
		[timezone],
	);

	const {
		myDashboard: { data: dashboardQuery, isLoading, isError, refetch },
	} = useDashboard(query);
	const dashboard = dashboardQuery?.data;

	if (isLoading) {
		return <LoadingDashboard />;
	}

	if (isError || !dashboard) {
		return (
			<main
				className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
				style={{ maxWidth: "calc(100dvw - 2rem)" }}
			>
				<Card>
					<CardHeader>
						<CardTitle>Không tải được dashboard</CardTitle>
						<CardDescription>
							Vui lòng thử lại để lấy dữ liệu mới nhất từ hệ
							thống.
						</CardDescription>
						<CardAction>
							<Button variant='outline' onClick={() => refetch()}>
								<RefreshCw />
								Tải lại
							</Button>
						</CardAction>
					</CardHeader>
				</Card>
			</main>
		);
	}

	return (
		<main
			className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
			style={{ maxWidth: "calc(100dvw - 2rem)" }}
		>
			<DashboardHeader
				greeting={dashboard.greeting}
				priorityTasks={dashboard.priorityTasks}
				recentWorkspaces={dashboard.recentWorkspaces}
			/>

			<section className='grid min-w-0 gap-4 xl:grid-cols-12'>
				<DashboardFocus
					focus={dashboard.focus}
					rhythmBlocks={dashboard.rhythmBlocks}
					stats={dashboard.stats}
				/>
				<DashboardRecentDeadlines recentDeadlines={dashboard.recentDeadlines} />
			</section>

			<DashboardStats stats={dashboard.stats} />

			<section className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12'>
				<DashboardPriorityTasks priorityTasks={dashboard.priorityTasks} />
				<DashboardRecentWorkspaces recentWorkspaces={dashboard.recentWorkspaces} />
			</section>

			<section className='grid min-w-0 gap-4 xl:grid-cols-12'>
				<DashboardRecentActivities recentActivities={dashboard.recentActivities} />
				<DashboardSuggestions suggestions={dashboard.suggestions} stats={dashboard.stats} />
			</section>
		</main>
	);
}
