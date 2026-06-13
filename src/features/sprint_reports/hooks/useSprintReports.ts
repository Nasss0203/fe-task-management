import { sprintReportService } from "@/services/sprint_report/sprint_report.service";
import { SPRINT_REPORT_KEY, SprintReportParams } from "@/services/sprint_report/type";
import { useQuery } from "@tanstack/react-query";

export function useSprintReports(input: SprintReportParams) {
  const getSprintReports = useQuery({
    queryKey: [
      SPRINT_REPORT_KEY.SPRINT_REPORTS,
      input.workspaceId,
      input.projectId,
    ],
    queryFn: () => sprintReportService.getSprintReports(input),
    enabled: Boolean(input.workspaceId && input.projectId),
  });

  return {
    getSprintReports,
    sprintReports: getSprintReports.data || [],
    isLoading: getSprintReports.isLoading,
    isError: getSprintReports.isError,
    error: getSprintReports.error,
    refetch: getSprintReports.refetch,
  };
}
