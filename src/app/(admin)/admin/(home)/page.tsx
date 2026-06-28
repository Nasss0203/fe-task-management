"use client";

import { RecentActivity } from "@/components/admin/activity/recent-activity";
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart";
import { WorkspaceGrowthChart } from "@/components/admin/charts/workspace-growth-chart";
import { WorkspacePlanChart } from "@/components/admin/charts/workspace-plan-chart";
import { DashboardHeader } from "@/components/admin/header/dashboard-header";
import { SystemHealth } from "@/components/admin/health/system-health";
import { RetentionCard } from "@/components/admin/retention/retention-card";
import {
	adminMetricCardClass,
	getAdminToneClass,
} from "@/components/admin/shared/theme";
import { RecentWorkspacesTable } from "@/components/admin/table/recent-workspaces-table";
import { useAdminDashboard } from "@/features/admin/modules/dashboard/hooks/useAdminDashboard";
import type {
	AdminFindAllWorkspaceQuery,
	UserGrowthPeriod,
	WorkspaceGrowthPeriod,
	WorkspaceItem,
} from "@/services/admin/dashboard/type";
import type { PaginationState } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	AlertTriangle,
	BriefcaseBusiness,
	CheckSquare,
	CreditCard,
	Database,
	ShieldCheck,
	TrendingUp,
	Users,
	Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";

type MetricItem = {
	title: string;
	value: number;
	description: string;
	icon: LucideIcon;
	accentClass: string;
};

type SignalItem = {
	label: string;
	value: string;
	description: string;
	icon: LucideIcon;
	tone: "success" | "warning" | "neutral";
};

const formatRate = (value: number, total: number) => {
	if (!total) return "0%";
	return `${Math.round((value / total) * 100)}%`;
};

const isPaidWorkspace = (plan?: string) => {
	const normalizedPlan = plan?.toLowerCase();
	return normalizedPlan === "pro";
};

const getWorkspaceItems = (value: unknown): WorkspaceItem[] => {
	if (Array.isArray(value)) {
		return value;
	}

	if (
		typeof value === "object" &&
		value !== null &&
		"data" in value &&
		Array.isArray((value as { data?: unknown }).data)
	) {
		return (value as { data: WorkspaceItem[] }).data;
	}

	return [];
};

const hasWorkspaceFilters = (query: AdminFindAllWorkspaceQuery) => {
	return Boolean(query.search?.trim() || query.plan || query.createdAt);
};

const filterWorkspaces = (
	workspaces: WorkspaceItem[],
	query: AdminFindAllWorkspaceQuery,
) => {
	const search = query.search?.trim().toLowerCase();
	const createdAt = query.createdAt;

	return workspaces.filter((workspace) => {
		const matchesSearch =
			!search ||
			[
				workspace.name,
				workspace.slug,
				workspace.owner,
				workspace.ownerName,
				workspace.ownerEmail,
			]
				.filter(Boolean)
				.some((value) => value!.toLowerCase().includes(search));

		const matchesPlan = !query.plan || workspace.plan === query.plan;
		const matchesCreatedAt =
			!createdAt || workspace.createdAt?.slice(0, 10) === createdAt;

		return matchesSearch && matchesPlan && matchesCreatedAt;
	});
};
function MetricTile({ item }: { item: MetricItem }) {
	const Icon = item.icon;

	return (
		<div className={adminMetricCardClass}>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<p className='text-sm font-medium text-muted-foreground'>{item.title}</p>
					<p className='mt-2 text-2xl font-bold text-foreground'>
						{item.value}
					</p>
				</div>

				<div
					className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.accentClass}`}
				>
					<Icon className='h-5 w-5' />
				</div>
			</div>

			<p className='mt-3 text-xs leading-4 text-muted-foreground'>
				{item.description}
			</p>
		</div>
	);
}

function SignalRow({ item }: { item: SignalItem }) {
	const Icon = item.icon;
	const toneClass =
		item.tone === "success"
			? getAdminToneClass("success", "icon")
			: item.tone === "warning"
				? getAdminToneClass("warning", "icon")
				: getAdminToneClass("neutral", "icon");

	return (
		<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm'>
			<div className='flex min-w-0 items-center gap-3'>
				<div
					className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}
				>
					<Icon className='h-4 w-4' />
				</div>
				<div className='min-w-0'>
					<p className='text-sm font-semibold text-foreground line-clamp-1'>
						{item.label}
					</p>
					<p className='mt-0.5 truncate text-xs text-muted-foreground'>
						{item.description}
					</p>
				</div>
			</div>

			<div className='shrink-0 text-sm font-bold text-foreground sm:text-right sm:max-w-[40%] self-end sm:self-auto text-right'>
				{item.value}
			</div>
		</div>
	);
}

export default function AdminDashboardPage() {
	const [workspaceFilters, setWorkspaceFilters] = useState<AdminFindAllWorkspaceQuery>({});
	const [workspacePagination, setWorkspacePagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [userGrowthPeriod, setUserGrowthPeriod] = useState<UserGrowthPeriod>('7d');
	const [workspaceGrowthPeriod, setWorkspaceGrowthPeriod] = useState<WorkspaceGrowthPeriod>('7d');

	const workspaceQuery = useMemo<AdminFindAllWorkspaceQuery>(
		() => ({
			page: workspacePagination.pageIndex + 1,
			pageSize: workspacePagination.pageSize,
		}),
		[workspacePagination],
	);

	const {
		dashboardSummary,
		workspaces,
		allWorkspaces,
		userOverview,
		userGrowth,
		workspaceGrowth,
		workspacePlan,
		retentionMetrics,
		systemHealth,
		recentActivities,
	} = useAdminDashboard(
		workspaceQuery,
		userGrowthPeriod,
		workspaceGrowthPeriod,
	);

	const summary = dashboardSummary.data?.data;
	const workspacePage = workspaces.data?.data;
	const workspaceItems = workspacePage?.data ?? [];
	const allWorkspaceItems = getWorkspaceItems(allWorkspaces.data?.data);
	const isFilteringWorkspaces = hasWorkspaceFilters(workspaceFilters);
	const recentWorkspaceItems = useMemo(() => {
		if (!isFilteringWorkspaces) {
			return workspaceItems;
		}

		return filterWorkspaces(allWorkspaceItems, workspaceFilters);
	}, [
		allWorkspaceItems,
		isFilteringWorkspaces,
		workspaceFilters,
		workspaceItems,
	]);
	const visibleWorkspaceItems = useMemo(() => {
		const start = workspacePagination.pageIndex * workspacePagination.pageSize;
		const end = start + workspacePagination.pageSize;

		return recentWorkspaceItems.slice(start, end);
	}, [recentWorkspaceItems, workspacePagination]);
	const overview = userOverview.data?.data;
	const userGrowthItems = userGrowth.data?.data ?? [];
	const workspaceGrowthItems = workspaceGrowth.data?.data ?? [];
	const workspacePlanItems = workspacePlan.data?.data ?? [];
	const retentionMetricItems = retentionMetrics.data?.data ?? [];
	const systemHealthItems = systemHealth.data?.data ?? [];
	const recentActivityItems = recentActivities.data?.data ?? [];

	const paidWorkspacesFromList = allWorkspaceItems.filter((workspace) =>
		isPaidWorkspace(workspace.plan),
	).length;

	const totalUsers = summary?.totalUsers ?? overview?.totalUsers ?? 0;
	const totalWorkspaces =
		summary?.totalWorkspaces || allWorkspaceItems.length || 0;
	const totalProjects = summary?.totalProjects ?? 0;
	const totalTasks = summary?.totalTasks ?? 0;

	const paidWorkspaces =
		summary?.paidWorkspaces && summary.paidWorkspaces > 0
			? summary.paidWorkspaces
			: paidWorkspacesFromList;

	const activeUsers =
		summary?.activeUsersLast30Days && summary.activeUsersLast30Days > 0
			? summary.activeUsersLast30Days
			: (overview?.activeUsers ?? 0);

	const workspacePlanData =
		workspacePlanItems.some(
			(item) =>
				item.name.toLowerCase() === "pro" && Number(item.value) > 0,
		) || paidWorkspacesFromList === 0
			? workspacePlanItems
			: [
					{
						name: "Free",
						value: Math.max(
							allWorkspaceItems.length - paidWorkspacesFromList,
							0,
						),
					},
					{ name: "Pro", value: paidWorkspacesFromList },
				];

	const warningServices = systemHealthItems.filter(
		(item) => item.level !== "success",
	).length;
	const activeUserRate = formatRate(activeUsers, totalUsers);
	const paidWorkspaceRate = formatRate(paidWorkspaces, totalWorkspaces);
	const latestUserGrowth =
		userGrowthItems[userGrowthItems.length - 1]?.users ?? 0;
	const latestWorkspaceGrowth =
		workspaceGrowthItems[workspaceGrowthItems.length - 1]?.workspaces ?? 0;

	const metrics: MetricItem[] = [
		{
			title: "Người dùng",
			value: totalUsers,
			description: `${activeUsers} tài khoản đang hoạt động`,
			icon: Users,
			accentClass: getAdminToneClass("brand", "icon"),
		},
		{
			title: "Workspace",
			value: totalWorkspaces,
			description: `${paidWorkspaces} workspace trả phí`,
			icon: BriefcaseBusiness,
			accentClass: getAdminToneClass("success", "icon"),
		},
		{
			title: "Project",
			value: totalProjects,
			description: "Tổng project trên toàn hệ thống",
			icon: Workflow,
			accentClass: getAdminToneClass("accent", "icon"),
		},
		{
			title: "Task",
			value: totalTasks,
			description: "Tổng task đã được tạo",
			icon: CheckSquare,
			accentClass: getAdminToneClass("warning", "icon"),
		},
	];

	const signals: SignalItem[] = [
		{
			label: "Tỷ lệ user active",
			value: activeUserRate,
			description: "Active / tổng người dùng",
			icon: Activity,
			tone: activeUsers > 0 ? "success" : "neutral",
		},
		{
			label: "Tỷ lệ workspace Pro",
			value: paidWorkspaceRate,
			description: "Pro / tổng workspace",
			icon: CreditCard,
			tone: paidWorkspaces > 0 ? "success" : "neutral",
		},
		{
			label: "Dịch vụ cần theo dõi",
			value: String(warningServices),
			description: "Warning hoặc risk trong system health",
			icon: AlertTriangle,
			tone: warningServices > 0 ? "warning" : "success",
		},
		{
			label: "Tăng trưởng mới nhất",
			value: `+${latestUserGrowth} user, +${latestWorkspaceGrowth} ws`,
			description: "Điểm dữ liệu mới nhất trong chart",
			icon: TrendingUp,
			tone:
				latestUserGrowth > 0 || latestWorkspaceGrowth > 0
					? "success"
					: "neutral",
		},
	];

	if (
		dashboardSummary.isLoading ||
		workspaces.isLoading ||
		allWorkspaces.isLoading ||
		userOverview.isLoading ||
		workspacePlan.isLoading ||
		retentionMetrics.isLoading ||
		systemHealth.isLoading ||
		recentActivities.isLoading
	) {
		return <div className='text-muted-foreground p-6'>Đang tải dashboard...</div>;
	}

	if (dashboardSummary.isError || workspaces.isError) {
		return <div className='text-destructive p-6'>Không thể tải dashboard</div>;
	}

	return (
		<div className='space-y-6 p-4 sm:p-6 lg:p-8'>
			<DashboardHeader />

			<section className='rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm sm:p-6'>
				<div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<div className='mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
							<Database className='h-4 w-4 text-primary' />
							Live overview
						</div>
						<h2 className='text-xl font-bold text-foreground'>
							Tình hình vận hành
						</h2>
					</div>
					<div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${getAdminToneClass("success")}`}>
						<ShieldCheck className='h-4 w-4' />
						Dữ liệu trực tiếp
					</div>
				</div>

				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
					{metrics.map((item) => (
						<MetricTile key={item.title} item={item} />
					))}
				</div>

				<div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
					{signals.map((item) => (
						<SignalRow key={item.label} item={item} />
					))}
				</div>
			</section>

			<section className='grid items-start gap-3 xl:grid-cols-3'>
				<div className='space-y-3 xl:col-span-2'>
					<UserGrowthChart
						data={userGrowth.isError ? [] : userGrowthItems}
						period={userGrowthPeriod}
						onPeriodChange={setUserGrowthPeriod}
						isLoading={userGrowth.isFetching}
					/>

					<WorkspaceGrowthChart
						data={
							workspaceGrowth.isError ? [] : workspaceGrowthItems
						}
						period={workspaceGrowthPeriod}
						onPeriodChange={setWorkspaceGrowthPeriod}
						isLoading={workspaceGrowth.isFetching}
					/>
				</div>

				<div className='space-y-3'>
					<WorkspacePlanChart
						data={workspacePlan.isError ? [] : workspacePlanData}
					/>

					<RetentionCard
						items={retentionMetrics.isError ? [] : retentionMetricItems}
					/>
				</div>
			</section>

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<RecentWorkspacesTable
						items={visibleWorkspaceItems}
						query={{
							...workspaceFilters,
							page: workspacePagination.pageIndex + 1,
							pageSize: workspacePagination.pageSize,
						}}
						pagination={workspacePagination}
						pageCount={
							isFilteringWorkspaces
								? Math.max(
										Math.ceil(
											recentWorkspaceItems.length /
												workspacePagination.pageSize,
										),
										1,
									)
								: (workspacePage?.totalPages ?? 1)
						}
						totalRows={
							isFilteringWorkspaces
								? recentWorkspaceItems.length
								: (workspacePage?.total ?? 0)
						}
						onPaginationChange={setWorkspacePagination}
						onQueryChange={(nextQuery) => {
							setWorkspacePagination((current) => ({
								...current,
								pageIndex: 0,
								pageSize: nextQuery.pageSize ?? current.pageSize,
							}));
							setWorkspaceFilters({
								search: nextQuery.search,
								plan: nextQuery.plan,
								createdAt: nextQuery.createdAt,
							});
						}}
					/>
				</div>

				<div className='space-y-4'>
					<SystemHealth
						items={systemHealth.isError ? [] : systemHealthItems}
					/>

					<RecentActivity
						items={
							recentActivities.isError ? [] : recentActivityItems
						}
					/>
				</div>
			</section>
		</div>
	);
}
