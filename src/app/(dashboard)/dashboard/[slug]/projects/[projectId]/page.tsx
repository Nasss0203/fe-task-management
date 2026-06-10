"use client";

import { ProjectBlock } from "@/components/block";
import type { AvailableTabItem } from "@/components/block/ProjectBlock";
import {
	BOARD_VIEW_CONFIG,
	isBoardViewEnabled,
} from "@/features/board/components/board/view-board";
import { useBoards } from "@/features/board/hooks/useBoards";
import { usePage } from "@/features/page/hooks/usePage";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { normalizeDatabaseViewConfig } from "@/services/page_block/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useProject } from "@/features/project/hooks/useProject";
import ProjectDropdown from "@/features/project/components/project/ProjectDropdown";
import { useProjectNameDraftStore } from "@/stores/use-project-name-draft";
import { toast } from "sonner";

const RestPage = () => {
	const params = useParams<{
		slug: string;
		projectId: string;
	}>();



	const projectId = params.projectId;

	const {
		pages: { data: pageData },
	} = usePage();

	const page = pageData?.data;
	const workspaceId = page?.workspace_id;

	const blockId = page?.blocks?.find((block) => {
		const config = normalizeDatabaseViewConfig(block.data_config);
		return config?.project_id === projectId;
	})?.id;

	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const [activeTab, setActiveTab] = useState<BoardViewType>(
		BoardViewType.BOARD,
	);

	const { projects, updateProject } = useProject(workspaceId);
	const project = useMemo(() => {
		return projects.data?.data.find((p) => p.id === projectId);
	}, [projects.data?.data, projectId]);

	const projectName = project?.name ?? "Untitled project";
	const draftName = useProjectNameDraftStore(
		(state) => state.drafts[projectId],
	);
	const setDraft = useProjectNameDraftStore((state) => state.setDraft);
	const clearDraft = useProjectNameDraftStore((state) => state.clearDraft);
	const value = draftName ?? projectName;

	const [isEditingName, setIsEditingName] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const skipBlurRef = useRef(false);
	const ignoreBlurUntilRef = useRef(0);

	useEffect(() => {
		if (!isEditingName) return;

		const frame = window.requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});

		return () => window.cancelAnimationFrame(frame);
	}, [isEditingName]);

	const startEditingName = () => {
		skipBlurRef.current = false;
		ignoreBlurUntilRef.current = Date.now() + 250;
		setDraft(projectId, value);
		setIsEditingName(true);
	};

	const cancelEditingName = () => {
		skipBlurRef.current = true;
		setDraft(projectId, projectName);
		setIsEditingName(false);
	};

	const commitName = async () => {
		const name = value.trim();

		if (!name) {
			toast.error("Ten project khong duoc de trong.");
			setDraft(projectId, projectName);
			inputRef.current?.focus();
			return;
		}

		if (name === projectName) {
			clearDraft(projectId);
			setIsEditingName(false);
			return;
		}

		if (!workspaceId || !projectId) return;

		try {
			await updateProject.mutateAsync({
				workspaceId,
				projectId,
				data: {
					name,
				},
			});
			clearDraft(projectId);
			setIsEditingName(false);
			toast.success("Project da duoc doi ten.");
		} catch (error) {
			console.error("renameProject failed", error);
			toast.error("Khong the doi ten project.");
		}
	};

	const { findBoard } = useBoards({
		workspaceId,
		projectId,
	});
	const { canUseSprint } = useWorkspaceFeatures(workspaceId);

	const boards = useMemo<BoardItem[]>(
		() => findBoard.data?.data ?? [],
		[findBoard.data?.data],
	);

	const availableTabs = useMemo<AvailableTabItem[]>(() => {
		return boards
			.filter((board) => {
				return isBoardViewEnabled(board.viewType, {
					canUseSprint,
				});
			})
			.map((board) => {
				const config = BOARD_VIEW_CONFIG[board.viewType]!;

				return {
					icon: config.icon,
					type: config.label,
					value: board.viewType,
					boardId: board.id,
				};
			});
	}, [boards, canUseSprint]);

	const activeTabValue = availableTabs.some((tab) => tab.value === activeTab)
		? activeTab
		: (availableTabs[0]?.value ?? activeTab);

	const activeBoard = useMemo(() => {
		return boards.find((board) => board.viewType === activeTabValue);
	}, [boards, activeTabValue]);

	useEffect(() => {
		if (!activeBoard?.id) return;
		setCurrentProjectId(projectId);
		setCurrentBoardId(activeBoard.id);
	}, [activeBoard?.id, projectId, setCurrentBoardId, setCurrentProjectId]);

	if (!workspaceId || !projectId) return null;

	return (
		<div className='flex flex-col gap-5'>
			<div className='flex items-center gap-2'>
				{isEditingName ? (
					<input
						ref={inputRef}
						value={value}
						disabled={updateProject.isPending}
						onChange={(event) =>
							setDraft(projectId, event.target.value)
						}
						onBlur={() => {
							if (Date.now() < ignoreBlurUntilRef.current) {
								window.requestAnimationFrame(() => {
									inputRef.current?.focus();
								});
								return;
							}

							if (skipBlurRef.current) {
								skipBlurRef.current = false;
								return;
							}

							void commitName();
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								event.currentTarget.blur();
							}

							if (event.key === "Escape") {
								event.preventDefault();
								cancelEditingName();
							}
						}}
						className='min-w-0 max-w-[min(560px,60vw)] rounded border border-blue-500/60 bg-background px-1 text-2xl font-semibold text-foreground outline-none ring-2 ring-blue-500/20'
					/>
				) : (
					<div className='min-w-0 max-w-[min(560px,60vw)] truncate px-1 text-2xl font-semibold text-foreground'>
						{value}
					</div>
				)}

				{project && (
					<ProjectDropdown
						project={project}
						workspace={{
							id: workspaceId,
							name: "", // Will be filled properly if needed
							slug: params.slug,
						}}
						onRenameProject={startEditingName}
					/>
				)}
			</div>
			<div className='min-h-0 flex-1 overflow-y-auto px-10 pb-10'>
				<ProjectBlock
					context='project'
					blockId={blockId}
					projectId={projectId}
					workspaceId={workspaceId}
					activeTab={activeTabValue}
					availableTabs={availableTabs}
					boards={boards}
					activeBoard={activeBoard}
					setActiveTab={setActiveTab}
				/>
			</div>
		</div>
	);
};

export default RestPage;
