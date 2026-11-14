import { create } from "zustand";

import type { PlanLimitNotice } from "../lib/plan-limit";

interface PlanLimitDialogState {
	notice: PlanLimitNotice | null;
	show: (notice: PlanLimitNotice) => void;
	close: () => void;
}

export const usePlanLimitDialog = create<PlanLimitDialogState>((set) => ({
	notice: null,
	show: (notice) => set({ notice }),
	close: () => set({ notice: null }),
}));
