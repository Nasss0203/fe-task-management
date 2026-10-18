import type { ClaimedTemplateDto, PageTemplate } from "@/entities/template";

/** Keep the library summary separate from creator aggregates and permission grants. */
export function toClaimedTemplateCard(template: ClaimedTemplateDto) {
	const isRestricted =
		template.visibility !== "PUBLIC" || template.name === null;
	const version = template.published_version;
	const publishedVersion =
		!isRestricted &&
		version?.template_id === template.template_id &&
		version.status === "PUBLISHED"
			? version
			: null;
	const isArchived = template.status === "ARCHIVED";
	const isUnpublished =
		!isArchived &&
		!isRestricted &&
		template.listing_status !== "PUBLISHED";
	const canNavigateToPublicDetail =
		!isArchived &&
		!isRestricted &&
		template.visibility === "PUBLIC" &&
		template.listing_status === "PUBLISHED" &&
		publishedVersion !== null;
	return {
		id: template.template_id,
		name: isRestricted ? "Restricted template" : (template.name ?? "Template"),
		description: isRestricted
			? "This template is now private or workspace-only. Its details are hidden."
			: template.description,
		icon: isRestricted ? null : template.icon,
		cover_url: isRestricted ? null : template.cover_url,
		visibility: template.visibility,
		claimed_at: template.claimed_at,
		version: publishedVersion,
		isRestricted,
		isArchived,
		isUnpublished,
		canNavigateToPublicDetail,
		// UI eligibility to attempt Use; backend remains authoritative.
		allowUseAttempt: !isArchived && !isRestricted && publishedVersion !== null,
		allowDetails: !isArchived && !isRestricted,
		statusMessage: isArchived
			? "Archived · Unavailable"
			: isRestricted
				? "Restricted · Unavailable"
				: !publishedVersion
					? "No published version available"
					: template.listing_status === "DRAFT"
						? "Unpublished · In your library"
						: null,
		isFree: template.source === "FREE_CLAIM",
		sourceLabel: (template.source === "PAID_PURCHASE"
			? "Purchased"
			: "Claimed") as LibrarySourceLabel,
	};
}

export type LibrarySourceLabel = "Purchased" | "Claimed" | "Created";
export type ClaimedTemplateCardModel = ReturnType<typeof toClaimedTemplateCard>;

/** The user's own templates; the creator may use every official release. */
export function toCreatedTemplateCard(
	template: PageTemplate,
): ClaimedTemplateCardModel {
	const isArchived = template.status === "ARCHIVED";
	return {
		id: template.id,
		name: template.name,
		description: template.description,
		icon: template.icon,
		cover_url: template.cover_url,
		visibility: template.visibility,
		claimed_at: template.created_at,
		version: template.version?.status === "PUBLISHED" ? template.version : null,
		isRestricted: false,
		isArchived,
		isUnpublished: false,
		canNavigateToPublicDetail: false,
		allowUseAttempt: !isArchived,
		allowDetails: true,
		statusMessage: isArchived ? "Archived · Unavailable" : null,
		isFree: false,
		sourceLabel: "Created",
	};
}
