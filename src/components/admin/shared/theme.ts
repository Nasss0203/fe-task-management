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
		badge: "border-border/70 bg-muted/35 text-muted-foreground",
		icon: "border-border/70 bg-muted/45 text-muted-foreground",
		soft: "border-border/70 bg-background/60 text-foreground",
		text: "text-muted-foreground",
	},
	brand: {
		badge: "border-primary/20 bg-primary/10 text-primary",
		icon: "border-primary/20 bg-primary/12 text-primary",
		soft: "border-primary/15 bg-primary/8 text-primary",
		text: "text-primary",
	},
	info: {
		badge: "border-info/25 bg-info/10 text-info",
		icon: "border-info/25 bg-info/12 text-info",
		soft: "border-info/20 bg-info/8 text-info",
		text: "text-info",
	},
	success: {
		badge: "border-success/25 bg-success/10 text-success",
		icon: "border-success/25 bg-success/12 text-success",
		soft: "border-success/18 bg-success/8 text-success",
		text: "text-success",
	},
	warning: {
		badge: "border-warning/28 bg-warning/12 text-warning",
		icon: "border-warning/28 bg-warning/14 text-warning",
		soft: "border-warning/20 bg-warning/8 text-warning",
		text: "text-warning",
	},
	danger: {
		badge: "border-danger/25 bg-danger/10 text-danger",
		icon: "border-danger/25 bg-danger/12 text-danger",
		soft: "border-danger/18 bg-danger/8 text-danger",
		text: "text-danger",
	},
	accent: {
		badge: "border-accent-foreground/14 bg-accent text-accent-foreground",
		icon: "border-accent-foreground/14 bg-accent text-accent-foreground",
		soft: "border-accent-foreground/10 bg-accent/70 text-accent-foreground",
		text: "text-accent-foreground",
	},
} as const;

export const adminPanelClass =
	"rounded-3xl border border-border/70 bg-card/95 shadow-sm supports-[backdrop-filter]:bg-card/88";
export const adminPanelCompactClass =
	"rounded-2xl border border-border/70 bg-card/95 shadow-sm supports-[backdrop-filter]:bg-card/88";
export const adminInsetPanelClass =
	"rounded-2xl border border-border/60 bg-background/72 shadow-sm supports-[backdrop-filter]:bg-background/60";
export const adminSubtlePanelClass =
	"rounded-2xl border border-border/55 bg-muted/30";
export const adminTableShellClass =
	"overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-sm supports-[backdrop-filter]:bg-card/88";
export const adminEmptyStateClass =
	"rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center";
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
	"h-10 w-full rounded-xl border border-input bg-background/75 px-3 text-sm text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground";
export const adminInputElevatedClass =
	"h-11 w-full rounded-2xl border border-input bg-background/78 px-3 text-sm text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground";
export const adminTextareaClass =
	"w-full rounded-xl border border-input bg-background/75 px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground";
export const adminTextareaElevatedClass =
	"w-full rounded-2xl border border-input bg-background/78 px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground";
export const adminSearchInputClass = cn(adminInputClass, "pl-10 pr-4");
export const adminSearchInputElevatedClass = cn(
	adminInputElevatedClass,
	"pl-10 pr-4",
);
export const adminSearchIconClass =
	"pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground";
export const adminActionButtonClass =
	"h-10 rounded-xl border border-border/70 bg-background/75 px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground";
export const adminIconButtonClass =
	"inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/75 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground";
export const adminCountChipClass =
	"rounded-full border border-border/70 bg-background/75 px-3 py-1 text-sm text-muted-foreground";
export const adminSectionTabClass =
	"rounded-xl border border-border/70 bg-background/75 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground";
export const adminSectionTabActiveClass =
	"border-primary/20 bg-primary/10 text-primary shadow-sm";
export const adminTableHeadingClass =
	"border-b border-border/70 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground";
export const adminTableRowClass =
	"text-sm text-foreground transition-colors hover:bg-muted/28";
export const adminTableCellClass = "border-border/50 bg-background/28";
export const adminMenuContentClass =
	"rounded-2xl border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-xl";
export const adminMenuItemClass =
	"cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-accent focus:text-accent-foreground";
export const adminMenuSeparatorClass = "my-1 bg-border/70";
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
