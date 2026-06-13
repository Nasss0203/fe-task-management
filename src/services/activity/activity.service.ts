import instance from "../axios";
import { FindActivityResponse } from "./type";
import { ApiResponse } from "../types";

export const findActivitiesByEntityApi = async ({
  workspaceId,
  entityType,
  entityId,
  limit = 20,
  cursor,
}: {
  workspaceId: string;
  entityType: string;
  entityId: string;
  limit?: number;
  cursor?: string;
}): Promise<FindActivityResponse> => {
  const response = await instance.get<ApiResponse<FindActivityResponse>>(
    `/activity/workspaces/${workspaceId}/entities/${entityType}/${entityId}`,
    {
      params: { limit, cursor },
    }
  );
  return response.data.data;
};
