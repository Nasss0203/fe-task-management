import { useQuery } from "@tanstack/react-query";
import { WORKSPACE_TEMPLATE_KEY } from "@/services/workspace-template/type";
import { getWorkspaceTemplatesApi, getWorkspaceTemplateByIdApi } from "@/services/workspace-template/workspace-template.service";

export const useWorkspaceTemplates = (params?: {
	ownedByMe?: boolean;
	status?: string;
	visibility?: string;
	page?: number;
	limit?: number;
}) => {
	const workspaceTemplatesFindAll = useQuery({
		queryKey: [WORKSPACE_TEMPLATE_KEY.TEMPLATES, params],
		queryFn: () => getWorkspaceTemplatesApi(params),
	});

	return {
		workspaceTemplatesFindAll,
	};
};

export const useWorkspaceTemplate = (id: string) => {
	const workspaceTemplateFindOne = useQuery({
		queryKey: [WORKSPACE_TEMPLATE_KEY.TEMPLATE_DETAIL, id],
		queryFn: () => getWorkspaceTemplateByIdApi(id),
		enabled: !!id,
	});

	return {
		workspaceTemplateFindOne,
	};
};
