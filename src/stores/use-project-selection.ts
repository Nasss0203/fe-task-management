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
	(set, get) => ({
		currentWorkspaceId: null,
		currentProjectId: null,
		currentBoardId: null,

		setCurrentWorkspaceId: (id) => {
			const currentWorkspaceId = get().currentWorkspaceId;

			if (currentWorkspaceId === id) {
				set({ currentWorkspaceId: id });
				return;
			}

			set({
				currentWorkspaceId: id,
				currentProjectId: null,
				currentBoardId: null,
			});
		},

		setCurrentProjectId: (id) => {
			const currentProjectId = get().currentProjectId;

			if (currentProjectId === id) {
				set({ currentProjectId: id });
				return;
			}

			set({
				currentProjectId: id,
				currentBoardId: null,
			});
		},

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
