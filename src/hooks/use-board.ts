import { findAllBoard, findBoardById } from "@/services/board/board.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";

export const useBoards = () => {
	const { currentWorkspaceId, currentProjectId } = useProjectSelectionStore();

	return useQuery({
		queryKey: ["boards", currentWorkspaceId, currentProjectId],
		queryFn: () => findAllBoard(currentWorkspaceId!, currentProjectId!),
		enabled: !!currentWorkspaceId && !!currentProjectId,
	});
};

export const useBoardDetail = () => {
	const { currentBoardId } = useProjectSelectionStore();

	return useQuery({
		queryKey: ["board-detail", currentBoardId],
		queryFn: () => findBoardById(currentBoardId!),
		enabled: !!currentBoardId,
	});
};
