// features/workspace-settings/model/use-settings-dialog.ts
import { create } from "zustand";

export type SettingsSection = "profile" | "workspace" | "members" | "billing";

interface SettingsDialogState {
	open: boolean;
	section: SettingsSection;
	setOpen: (open: boolean) => void;
	setSection: (section: SettingsSection) => void;
}

export const useSettingsDialog = create<SettingsDialogState>((set) => ({
	open: false,
	section: "profile",
	setOpen: (open) => set({ open }),
	setSection: (section) => set({ section }),
}));
