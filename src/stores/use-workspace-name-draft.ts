import { create } from "zustand";

type WorkspaceNameDraftStore = {
	drafts: Record<string, string>;
	setDraft: (workspaceId: string, name: string) => void;
	clearDraft: (workspaceId: string) => void;
};

export const useWorkspaceNameDraftStore = create<WorkspaceNameDraftStore>()(
	(set) => ({
		drafts: {},
		setDraft: (workspaceId, name) =>
			set((state) => ({
				drafts: {
					...state.drafts,
					[workspaceId]: name,
				},
			})),
		clearDraft: (workspaceId) =>
			set((state) => {
				const drafts = { ...state.drafts };
				delete drafts[workspaceId];

				return {
					drafts,
				};
			}),
	}),
);
