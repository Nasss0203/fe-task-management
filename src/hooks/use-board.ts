"use client";

import {
	CreateBoardAndAttachToPage,
	findAllBoard,
	findBoardById,
} from "@/services/board/board.service";
import { BOARD_KEY, CreateBoarDto } from "@/services/board/type";
import { PAGE_KEY } from "@/services/page/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseBoardsParams = {
	workspaceId?: string;
	projectId?: string;
	boardId?: string;
};

export const useBoards = ({
	workspaceId,
	projectId,
	boardId,
}: UseBoardsParams = {}) => {
	const { currentWorkspaceId, currentProjectId, currentBoardId } =
		useProjectSelectionStore();

	const queryClient = useQueryClient();

	const resolvedWorkspaceId = workspaceId ?? currentWorkspaceId ?? undefined;
	const resolvedProjectId = projectId ?? currentProjectId ?? undefined;
	const resolvedBoardId = boardId ?? currentBoardId ?? undefined;

	const createBoard = useMutation({
		mutationFn: async (data: CreateBoarDto) => {
			return await CreateBoardAndAttachToPage(data);
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: [
					BOARD_KEY.BOARD,
					variables.workspaceId,
					variables.projectId,
				],
			});

			await queryClient.invalidateQueries({
				queryKey: [PAGE_KEY.PAGE, variables.workspaceId],
			});
		},
		onError: (err) => {
			console.error("createBoard failed", err);
		},
	});

	const findBoard = useQuery({
		queryKey: [BOARD_KEY.BOARD, resolvedWorkspaceId, resolvedProjectId],
		queryFn: () => findAllBoard(resolvedWorkspaceId!, resolvedProjectId!),
		enabled: !!resolvedWorkspaceId && !!resolvedProjectId,
	});

	const boarDetail = useQuery({
		queryKey: [BOARD_KEY.BOARD, resolvedBoardId],
		queryFn: () => findBoardById(resolvedBoardId!),
		enabled: !!resolvedBoardId,
	});

	return {
		findBoard,
		createBoard,
		boarDetail,
	};
};
