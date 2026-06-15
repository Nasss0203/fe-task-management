import api from "@/services/axios";
import { SprintReport, SprintReportParams } from "./type";
import { ApiResponse } from "@/services/types";

export const sprintReportService = {
  getSprintReports: async (input: SprintReportParams): Promise<ApiResponse<SprintReport[]>> => {
    const { workspaceId, projectId } = input;
    const response = await api.get<ApiResponse<SprintReport[]>>(
      `/sprint-reports/workspaces/${workspaceId}/projects/${projectId}`,
    );
    return response.data;
  },
};
