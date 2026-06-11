import { useQuery } from "@tanstack/react-query";
import { WORKSPACE_TEMPLATE_KEY } from "@/services/workspace-template/type";
import { findAllWorkspaceTemplatesApi } from "@/services/workspace-template/workspace-template.service";

export const useWorkspaceTemplates = () => {
	const workspaceTemplatesFindAll = useQuery({
		queryKey: [WORKSPACE_TEMPLATE_KEY.WORKSPACE_TEMPLATE],
		queryFn: findAllWorkspaceTemplatesApi,
	});

	return {
		workspaceTemplatesFindAll,
	};
};
