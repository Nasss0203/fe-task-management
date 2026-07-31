import instance from "@/services/axios";
import type {
	AdminFindAllWorkspaceQuery,
	ApiResponse,
	DashboardSummaryResponseDto,
	PlanTypeWorkspace,
	WorkspaceItem,
	WorkspacePaginationResponse,
} from "./type";

type WorkspaceApiItem = Omit<WorkspaceItem, "plan"> & {
	plan?: string | null;
	planType?: string | null;
};

type WorkspacePaginationApiResponse = Omit<
	WorkspacePaginationResponse,
	"data"
> & {
	data: WorkspaceApiItem[];
};

const normalizeWorkspacePlan = (
	value?: string | null,
): PlanTypeWorkspace => {
	return value?.toLowerCase() === "pro" ? "pro" : "free";
};

const serializeWorkspaceQuery = (query?: AdminFindAllWorkspaceQuery) => {
	if (!query) return undefined;

	return query;
};

const normalizeWorkspace = (workspace: WorkspaceApiItem): WorkspaceItem => {
	const { planType, plan, ...rest } = workspace;

	return {
		...rest,
		plan: normalizeWorkspacePlan(plan ?? planType),
	};
};

const normalizeWorkspacePagination = (
	payload: WorkspaceApiItem[] | WorkspacePaginationApiResponse,
): WorkspacePaginationResponse => {
	if (Array.isArray(payload)) {
		return {
			data: payload.map(normalizeWorkspace),
			total: payload.length,
			page: 1,
			pageSize: payload.length,
			totalPages: 1,
		};
	}

	const data = Array.isArray(payload.data) ? payload.data : [];

	return {
		data: data.map(normalizeWorkspace),
		total: payload.total ?? data.length,
		page: payload.page ?? 1,
		pageSize: payload.pageSize ?? data.length,
		totalPages: payload.totalPages ?? 1,
	};
};

export const getAdminDashboardSummaryApi = async (): Promise<
	ApiResponse<DashboardSummaryResponseDto>
> => {
	const response = await instance.get<
		ApiResponse<DashboardSummaryResponseDto>
	>("/admin/dashboard/summary");

	return response.data;
};

export const findAllWorkspaceAdminApi = async (
	query?: AdminFindAllWorkspaceQuery,
): Promise<ApiResponse<WorkspacePaginationResponse>> => {
	const response = await instance.get<
		ApiResponse<WorkspaceApiItem[] | WorkspacePaginationApiResponse>
	>("/admin/findAll-workspaces", {
		params: serializeWorkspaceQuery(query),
	});

	return {
		...response.data,
		data: normalizeWorkspacePagination(response.data.data),
	};
};
