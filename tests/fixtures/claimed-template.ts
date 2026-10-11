import type { ClaimedTemplateDto } from "@/entities/template";

export const claimedTemplate: ClaimedTemplateDto = {
	entitlement_id: "entitlement-a",
	template_id: "template-a",
	source: "FREE_CLAIM",
	claimed_at: "2026-10-11T00:00:00.000Z",
	name: "Claimed planning",
	description: "Plan a project",
	icon: "📋",
	cover_url: null,
	visibility: "PUBLIC",
	status: "PUBLISHED",
	listing_status: "PUBLISHED",
	published_version: {
		id: "pinned-v1",
		template_id: "template-a",
		version_number: 1,
		status: "PUBLISHED",
		published_at: "2026-10-10T00:00:00.000Z",
	},
};
