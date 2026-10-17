import type { PageTemplate, TemplateListingDto } from "@/entities/template";

export type ListingState = "NOT_LISTED" | "DRAFT" | "UNPUBLISHED" | "LIVE";

export const LISTING_STATE_PRESENTATION: Record<
	ListingState,
	{ label: string; dot: string }
> = {
	NOT_LISTED: { label: "Not listed", dot: "bg-muted-foreground/50" },
	DRAFT: { label: "Draft", dot: "bg-amber-500" },
	UNPUBLISHED: { label: "Unpublished", dot: "bg-muted-foreground" },
	LIVE: { label: "Live", dot: "bg-emerald-500" },
};

export function getListingState(
	template: Pick<PageTemplate, "visibility" | "status">,
	listing?: TemplateListingDto | null,
): ListingState {
	if (!listing) return "NOT_LISTED";
	// Public visibility is required for the listing to be reachable.
	if (
		listing.status === "PUBLISHED" &&
		template.visibility === "PUBLIC" &&
		template.status !== "ARCHIVED"
	) {
		return "LIVE";
	}
	return listing.published_version_id ? "UNPUBLISHED" : "DRAFT";
}
