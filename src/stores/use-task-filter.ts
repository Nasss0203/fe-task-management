import { create } from "zustand";
import { FindBacklogTasksFilters } from "@/services/task/type";

type TaskFilterStore = {
	filtersByProject: Record<string, FindBacklogTasksFilters>;
	setFilters: (projectId: string, filters: Partial<FindBacklogTasksFilters>) => void;
	resetFilters: (projectId: string) => void;
	getFilters: (projectId: string) => FindBacklogTasksFilters;
};

export const useTaskFilterStore = create<TaskFilterStore>((set, get) => ({
	filtersByProject: {},
	setFilters: (projectId, newFilters) =>
		set((state) => ({
			filtersByProject: {
				...state.filtersByProject,
				[projectId]: {
					...(state.filtersByProject[projectId] || {}),
					...newFilters,
				},
			},
		})),
	resetFilters: (projectId) =>
		set((state) => {
			const newFilters = { ...state.filtersByProject };
			delete newFilters[projectId];
			return { filtersByProject: newFilters };
		}),
	getFilters: (projectId) => get().filtersByProject[projectId] || {},
}));
