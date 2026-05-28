"use client";

import { getMyDashboardApi } from "@/services/dashboard/dashboard.service";
import {
	DASHBOARD_KEY,
	type MyDashboardQuery,
} from "@/services/dashboard/type";
import { useQuery } from "@tanstack/react-query";

export const useDashboard = (query?: MyDashboardQuery) => {
	const myDashboard = useQuery({
		queryKey: [DASHBOARD_KEY.MY_DASHBOARD, query],
		queryFn: () => getMyDashboardApi(query),
		retry: false,
		refetchOnWindowFocus: false,
	});

	return {
		myDashboard,
	};
};
