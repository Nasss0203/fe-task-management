import { create } from "zustand";

interface PageSearchDialogState {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const usePageSearchDialog = create<PageSearchDialogState>((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
}));
