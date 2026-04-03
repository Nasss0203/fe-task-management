import { findPage } from "@/services/page/page.service";
import { PAGE_KEY } from "@/services/page/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";

export const usePage = () => {
	const { currentWorkspaceId } = useProjectSelectionStore();
	const pages = useQuery({
		queryKey: [PAGE_KEY.PAGE, currentWorkspaceId],
		queryFn: () => findPage(currentWorkspaceId as string),
	});

	return {
		pages,
	};
};
