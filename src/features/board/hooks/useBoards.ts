"use client";

import {
	createBoardApi,
	deleteBoardApi,
	findAllBoard,
	findBoardById,
} from "@/services/board/board.service";
import {
	BOARD_KEY,
	CreateBoarDto,
	DeleteBoardDto,
} from "@/services/board/type";
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
	const {
		currentWorkspaceId,
		currentProjectId,
		currentBoardId,
		setCurrentBoardId,
	} = useProjectSelectionStore();

	const queryClient = useQueryClient();

	const resolvedWorkspaceId = workspaceId ?? currentWorkspaceId ?? undefined;
	const resolvedProjectId = projectId ?? currentProjectId ?? undefined;
	const resolvedBoardId = boardId ?? currentBoardId ?? undefined;

	const createBoard = useMutation({
		mutationFn: async (data: CreateBoarDto) => {
			return await createBoardApi(data);
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: [
					BOARD_KEY.BOARD,
					variables.workspaceId,
					variables.projectId,
				],
			});
		},
		onError: (err) => {
			console.error("createBoard failed", err);
		},
	});

	const deleteBoard = useMutation({
		mutationFn: async (data: DeleteBoardDto) => {
			return await deleteBoardApi(data);
		},
		onSuccess: async (_, variables) => {
			if (resolvedBoardId === variables.boardId) {
				setCurrentBoardId(null);
			}

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [
						BOARD_KEY.BOARD,
						variables.workspaceId,
						variables.projectId,
					],
				}),
				queryClient.invalidateQueries({
					queryKey: [BOARD_KEY.BOARD, variables.boardId],
				}),
			]);
		},
		onError: (err) => {
			console.error("deleteBoard failed", err);
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
		deleteBoard,
		boarDetail,
	};
};
