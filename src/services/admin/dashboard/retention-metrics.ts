import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type { RetentionMetricItem } from "./type";

export const getRetentionMetricsApi = async (): Promise<
	ApiResponse<RetentionMetricItem[]>
> => {
	const response = await instance.get<ApiResponse<RetentionMetricItem[]>>(
		"/admin/dashboard/retention-metrics",
	);

	return response.data;
};
