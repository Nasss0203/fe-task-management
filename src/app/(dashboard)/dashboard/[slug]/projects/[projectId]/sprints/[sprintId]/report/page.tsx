"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SprintReportOverview } from "@/features/sprint_reports/components/SprintReportOverview";
import { sprintReportService } from '@/services/sprint_report/sprint_report.service';
import type { SprintReport } from "@/services/sprint_report/type";
import { Loader2 } from "lucide-react";
import { usePage } from "@/features/page/hooks/usePage";

const SprintReportPage = () => {
  const params = useParams<{
    slug: string;
    projectId: string;
    sprintId: string;
  }>();

  const { projectId, sprintId } = params;

  // Use the same trick from project page to get workspaceId
  const { pages: { data: pageData } } = usePage();
  const workspaceId = pageData?.data?.workspace_id;

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["sprint-reports", workspaceId, projectId],
    queryFn: () => sprintReportService.getSprintReports({workspaceId: workspaceId!, projectId}),
    enabled: !!workspaceId && !!projectId,
  });

  if (isLoading || !workspaceId) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-neutral-400" size={32} />
      </div>
    );
  }

  const allReports = reportsData?.data || [];
  const currentReport = allReports.find((r: SprintReport) => r.sprintId === sprintId);

  if (!currentReport) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-neutral-500">
        <h2 className="text-xl font-semibold mb-2">No Report Found</h2>
        <p>This sprint might not be completed yet, or no report was generated.</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        <SprintReportOverview report={currentReport} allReports={allReports} />
      </div>
    </div>
  );
};

export default SprintReportPage;
