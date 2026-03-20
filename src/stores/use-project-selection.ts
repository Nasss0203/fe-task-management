import { create } from "zustand";

type ProjectSelectionStore = {
	currentWorkspaceId: string | null;
	currentProjectId: string | null;
	currentBoardId: string | null;
	setCurrentWorkspaceId: (id: string | null) => void;
	setCurrentProjectId: (id: string | null) => void;
	setCurrentBoardId: (id: string | null) => void;
	resetProjectSelection: () => void;
};

export const useProjectSelectionStore = create<ProjectSelectionStore>(
	(set) => ({
		currentWorkspaceId: null,
		currentProjectId: null,
		currentBoardId: null,

		setCurrentWorkspaceId: (id) =>
			set({
				currentWorkspaceId: id,
				currentProjectId: null,
				currentBoardId: null,
			}),

		setCurrentProjectId: (id) =>
			set({
				currentProjectId: id,
				currentBoardId: null,
			}),

		setCurrentBoardId: (id) =>
			set({
				currentBoardId: id,
			}),

		resetProjectSelection: () =>
			set({
				currentWorkspaceId: null,
				currentProjectId: null,
				currentBoardId: null,
			}),
	}),
);
