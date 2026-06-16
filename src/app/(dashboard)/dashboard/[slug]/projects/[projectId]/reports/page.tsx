"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BarChart2, Loader2, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sprintReportService } from "@/services/sprint_report/sprint_report.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";

export default function ProjectReportsPage() {
	return <ReportsList />;
}

const ReportsList = () => {
	const params = useParams<{ slug: string; projectId: string }>();
	const { slug, projectId } = params;
	const { currentWorkspaceId } = useProjectSelectionStore();

	const { data: reportsData, isLoading } = useQuery({
		queryKey: ["sprint-reports", currentWorkspaceId, projectId],
		queryFn: () => sprintReportService.getSprintReports({ workspaceId: currentWorkspaceId!, projectId }),
		enabled: !!currentWorkspaceId && !!projectId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-100px)] w-full">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground animate-pulse font-medium">Đang tải báo cáo...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-[calc(100vh-100px)] pb-12 flex flex-col">
			<div className="w-full px-8 pt-8 pb-4 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href={`/dashboard/${slug}/projects/${projectId}`}>
						<Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<h1 className="text-2xl font-semibold text-foreground">Báo cáo Sprint</h1>
				</div>
			</div>

			<div className="w-full px-8 flex-1 mt-4">
				<h2 className="text-muted-foreground font-medium mb-6 flex items-center gap-2">
					<span className="text-foreground font-semibold">{reportsData?.data?.length || 0}</span> sprint đã hoàn thành trong dự án này
				</h2>
				
				{!reportsData?.data || reportsData.data.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-xl border-border bg-muted/20">
						<BarChart2 className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
						<h3 className="text-lg font-medium text-foreground">Không có dữ liệu</h3>
						<p className="text-muted-foreground text-center mt-2 max-w-sm text-sm">
							Hoàn thành một sprint để xem báo cáo hiệu suất chi tiết.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
						{reportsData.data.map((report) => {
							const taskProgress = report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0;
							const pointProgress = report.totalEstimate > 0 ? Math.round((report.completedEstimate / report.totalEstimate) * 100) : 0;
							
							// Format dates
							const startDate = report.startAt ? new Date(report.startAt) : null;
							const endDate = report.completedAt ? new Date(report.completedAt) : null;
							
							let dateString = "Không rõ thời gian";
							let daysDiff = 0;
							if (startDate && endDate) {
								const startStr = `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth()+1).toString().padStart(2, '0')}`;
								const endStr = `${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth()+1).toString().padStart(2, '0')}/${endDate.getFullYear()}`;
								daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
								dateString = `${startStr} - ${endStr} • ${daysDiff} ngày`;
							} else if (endDate) {
								dateString = `Hoàn thành: ${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth()+1).toString().padStart(2, '0')}/${endDate.getFullYear()}`;
							}

							return (
								<div
									key={report.id}
									className="group flex flex-col rounded-xl p-5 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 h-full"
								>
									<div className="flex justify-between items-start mb-1">
										<h3 className="font-semibold text-lg text-foreground">
											{report.sprintName}
										</h3>
										<div className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-medium border border-emerald-200 dark:border-emerald-800/50 whitespace-nowrap ml-2">
											Hoàn thành
										</div>
									</div>
									
									<p className="text-sm text-muted-foreground mb-4 line-clamp-1">
										{report.sprintGoal || "Không có mục tiêu"}
									</p>
									
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
										<Calendar className="w-3.5 h-3.5" />
										<span>{dateString}</span>
									</div>
									
									<div className="grid grid-cols-2 gap-3 mb-5">
										<div className="bg-secondary/50 rounded-lg p-3">
											<div className="text-xs text-muted-foreground mb-1">Tác vụ hoàn thành</div>
											<div className="text-xl font-semibold text-foreground mb-0.5 flex items-baseline gap-1">
												{report.completedTasks} <span className="text-muted-foreground text-sm font-normal">/ {report.totalTasks}</span>
											</div>
											<div className="text-[11px] text-muted-foreground">{taskProgress}% hoàn thành</div>
										</div>
										<div className="bg-secondary/50 rounded-lg p-3">
											<div className="text-xs text-muted-foreground mb-1">Story Points</div>
											<div className="text-xl font-semibold text-foreground mb-0.5 flex items-baseline gap-1">
												{report.completedEstimate} <span className="text-muted-foreground text-sm font-normal">/ {report.totalEstimate}</span>
											</div>
											<div className="text-[11px] text-muted-foreground">{pointProgress}% đạt mục tiêu</div>
										</div>
									</div>
									
									<div className="flex flex-col gap-2 mb-6">
										<div className="flex justify-between items-end">
											<span className="text-xs font-medium text-muted-foreground">Tiến độ</span>
											<span className="text-xs font-medium text-muted-foreground">{taskProgress}%</span>
										</div>
										<div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
											<div 
												className="h-full bg-emerald-500 rounded-full"
												style={{ width: `${taskProgress}%` }}
											/>
										</div>
									</div>

									<div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
										<div className="flex items-center -space-x-1.5">
											{report.memberPerformance?.slice(0, 4).map((member, i) => (
												<div key={member.assigneeId} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-semibold text-muted-foreground z-10 overflow-hidden" style={{ zIndex: 10 - i }}>
													{member.avatar ? (
														<img src={member.avatar} alt={member.assigneeName} className="w-full h-full object-cover" />
													) : (
														member.assigneeName ? member.assigneeName.substring(0, 2).toUpperCase() : "??"
													)}
												</div>
											))}
											{report.memberPerformance?.length > 4 && (
												<div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground" style={{ zIndex: 0 }}>
													+{report.memberPerformance.length - 4}
												</div>
											)}
										</div>
										<Link 
											href={`/dashboard/${slug}/projects/${projectId}/sprints/${report.sprintId}/report`}
											className="flex items-center gap-1.5 text-[13px] text-primary hover:text-primary/80 font-medium transition-colors"
										>
											<BarChart2 className="w-3.5 h-3.5" />
											Xem report
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
