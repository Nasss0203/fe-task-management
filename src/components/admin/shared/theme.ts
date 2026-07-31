import { cn } from "@/lib/utils";

export type AdminTone =
	| "neutral"
	| "brand"
	| "info"
	| "success"
	| "warning"
	| "danger"
	| "accent";

const toneVariants = {
	neutral: {
		badge: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
		icon: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
		soft: "border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]",
		text: "text-muted-foreground",
	},
	brand: {
		badge: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
		icon: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
		soft: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
		text: "text-primary",
	},
	info: {
		badge: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
		icon: "border-[#BFDBFE] bg-[#EFF6FF] text-[#3B82F6]",
		soft: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
		text: "text-info",
	},
	success: {
		badge: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
		icon: "border-[#BBF7D0] bg-[#F0FDF4] text-[#22C55E]",
		soft: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
		text: "text-success",
	},
	warning: {
		badge: "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]",
		icon: "border-[#FDE68A] bg-[#FFFBEB] text-[#EAB308]",
		soft: "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]",
		text: "text-warning",
	},
	danger: {
		badge: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
		icon: "border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]",
		soft: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
		text: "text-danger",
	},
	accent: {
		badge: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
		icon: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
		soft: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
		text: "text-[#7C3AED]",
	},
} as const;

export const adminPanelClass =
	"rounded-3xl border border-border bg-card shadow-sm";
export const adminPanelCompactClass =
	"rounded-2xl border border-border bg-card shadow-sm";
export const adminInsetPanelClass =
	"rounded-2xl border border-border bg-card shadow-sm";
export const adminSubtlePanelClass =
	"rounded-2xl border border-[#EEF2F6] bg-[#F8FAFC]";
export const adminTableShellClass =
	"overflow-hidden rounded-3xl border border-border bg-card shadow-sm";
export const adminEmptyStateClass =
	"rounded-3xl border border-dashed border-border bg-card p-10 text-center";
export const adminHeaderKickerClass =
	"flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";
export const adminPageTitleClass =
	"text-2xl font-semibold tracking-tight text-foreground sm:text-3xl";
export const adminPageDescriptionClass =
	"max-w-3xl text-sm leading-6 text-muted-foreground";
export const adminChipBaseClass =
	"inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium";
export const adminFieldLabelClass =
	"mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";
export const adminInputClass =
	"h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none transition hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-[#94A3B8]";
export const adminInputElevatedClass =
	"h-11 w-full rounded-2xl border border-input bg-card px-3 text-sm text-foreground outline-none transition hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-[#94A3B8]";
export const adminTextareaClass =
	"w-full rounded-xl border border-input bg-card px-3 py-3 text-sm text-foreground outline-none transition hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-[#94A3B8]";
export const adminTextareaElevatedClass =
	"w-full rounded-2xl border border-input bg-card px-3 py-3 text-sm text-foreground outline-none transition hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-[#94A3B8]";
export const adminSearchInputClass = cn(adminInputClass, "pl-10 pr-4");
export const adminSearchInputElevatedClass = cn(
	adminInputElevatedClass,
	"pl-10 pr-4",
);
export const adminSearchIconClass =
	"pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground";
export const adminActionButtonClass =
	"h-10 rounded-xl border border-input bg-card px-4 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC]";
export const adminIconButtonClass =
	"inline-flex size-10 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground transition hover:bg-[#F8FAFC] hover:text-foreground";
export const adminCountChipClass =
	"rounded-full border border-border bg-[#F8FAFC] px-3 py-1 text-sm text-muted-foreground";
export const adminSectionTabClass =
	"rounded-xl border border-border/70 bg-background/75 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground";
export const adminSectionTabActiveClass =
	"border-primary/20 bg-primary/10 text-primary shadow-sm";
export const adminTableHeadingClass =
	"border-b border-border bg-[#F8FAFC] text-left text-xs uppercase tracking-[0.12em] text-[#475569]";
export const adminTableRowClass =
	"text-sm text-foreground transition-colors hover:bg-[#F8FAFC]";
export const adminTableCellClass = "border-[#EEF2F6] bg-card";
export const adminMenuContentClass =
	"rounded-2xl border-0 bg-white p-1.5 text-[#1E293B] shadow-[0_16px_40px_rgba(15,23,42,0.16)]";
export const adminMenuItemClass =
	"cursor-pointer rounded-xl px-3 py-2.5 text-sm text-[#334155] transition-colors focus:bg-[#F8FAFC] focus:text-[#0F172A] data-[highlighted]:bg-[#F8FAFC] data-[highlighted]:text-[#0F172A]";
export const adminMenuSeparatorClass = "my-0 h-0 bg-transparent";
export const adminAvatarPlaceholderClass =
	"flex size-11 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-sm font-semibold text-foreground";
export const adminQuickStatClass =
	"flex items-center justify-between rounded-2xl border border-border/60 bg-background/65 px-4 py-3";
export const adminMetricCardClass =
	"rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm supports-[backdrop-filter]:bg-card/88";
export const adminDrawerContentClass =
	"left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-border/70 bg-background/96 text-foreground shadow-2xl supports-[backdrop-filter]:bg-background/92";
export const adminDrawerHeaderClass =
	"border-b border-border/70 px-6 py-5 text-left";
export const adminDrawerTitleClass =
	"text-xl font-semibold tracking-tight text-foreground";
export const adminDrawerDescriptionClass =
	"mt-1 text-sm leading-6 text-muted-foreground";
export const adminDrawerBodyClass =
	"no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 py-4";
export const adminDrawerFooterClass =
	"border-t border-border/70 px-6 py-4";
export const adminDrawerSectionClass = cn(adminInsetPanelClass, "p-4");
export const adminDrawerSectionTitleClass =
	"mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground";
export const adminDrawerInnerPanelClass = cn(adminSubtlePanelClass, "px-4 py-3");
export const adminDrawerFieldLabelClass = "mb-2 block text-sm text-muted-foreground";
export const adminDrawerGhostButtonClass =
	"h-9 rounded-xl border border-border/70 bg-background/75 px-3 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground";
export const adminDrawerPrimaryButtonClass =
	"h-11 w-full rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90";
export const adminDrawerSecondaryButtonClass =
	"h-11 w-full rounded-2xl border border-border/70 bg-background/75 px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground";
export const adminDrawerCodeBlockClass =
	"max-h-80 overflow-auto rounded-2xl border border-border/60 bg-background/78 p-4 text-xs leading-6 text-muted-foreground";
export const adminDrawerTokenClass =
	"rounded-full border border-border/70 bg-background/72 px-2.5 py-1 text-xs text-muted-foreground";

export function getAdminToneClass(
	tone: AdminTone,
	variant: "badge" | "icon" | "soft" | "text" = "badge",
) {
	return toneVariants[tone][variant];
}

export function adminToneBadgeClass(tone: AdminTone, className?: string) {
	return cn(adminChipBaseClass, getAdminToneClass(tone), className);
}
