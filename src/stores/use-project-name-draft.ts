import { create } from "zustand";

type ProjectNameDraftStore = {
	drafts: Record<string, string>;
	setDraft: (projectId: string, name: string) => void;
	clearDraft: (projectId: string) => void;
};

export const useProjectNameDraftStore = create<ProjectNameDraftStore>((set) => ({
	drafts: {},
	setDraft: (projectId, name) =>
		set((state) => ({
			drafts: { ...state.drafts, [projectId]: name },
		})),
	clearDraft: (projectId) =>
		set((state) => {
			const { [projectId]: _, ...rest } = state.drafts;
			return { drafts: rest };
		}),
}));
