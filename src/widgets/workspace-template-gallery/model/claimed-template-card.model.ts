import type { ClaimedTemplateDto } from "@/entities/template";

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
	};
}

export type ClaimedTemplateCardModel = ReturnType<typeof toClaimedTemplateCard>;
