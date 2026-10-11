import { describe, expect, it } from "vitest";
import { toClaimedTemplateCard } from "@/widgets/dashboard-templates/model/claimed-template-card.model";
import { claimedTemplate } from "../fixtures/claimed-template";

describe("toClaimedTemplateCard", () => {
	it("NAV-01: enables consumer detail navigation for public published templates with published version", () => {
		const card = toClaimedTemplateCard(claimedTemplate);
		expect(card.canNavigateToPublicDetail).toBe(true);
		expect(card.isUnpublished).toBe(false);
		expect(card.isRestricted).toBe(false);
		expect(card.isArchived).toBe(false);
		expect(card.allowDetails).toBe(true);
		expect(card.allowUseAttempt).toBe(true);
		expect(card.statusMessage).toBeNull();
	});

	it("NAV-07/08: marks unpublished templates as ineligible for consumer detail but eligible for Use attempt", () => {
		const card = toClaimedTemplateCard({
			...claimedTemplate,
			listing_status: "DRAFT",
		});
		expect(card.canNavigateToPublicDetail).toBe(false);
		expect(card.isUnpublished).toBe(true);
		expect(card.isRestricted).toBe(false);
		expect(card.allowDetails).toBe(true);
		expect(card.allowUseAttempt).toBe(true);
		expect(card.statusMessage).toBe("Unpublished · In your library");
	});

	it("NAV-09: marks PRIVATE or WORKSPACE as restricted without consumer detail or actions", () => {
		const privateCard = toClaimedTemplateCard({
			...claimedTemplate,
			visibility: "PRIVATE",
			name: null,
		});
		expect(privateCard.isRestricted).toBe(true);
		expect(privateCard.canNavigateToPublicDetail).toBe(false);
		expect(privateCard.isUnpublished).toBe(false);
		expect(privateCard.allowDetails).toBe(false);
		expect(privateCard.allowUseAttempt).toBe(false);
		expect(privateCard.name).toBe("Restricted template");
		expect(privateCard.icon).toBeNull();
		expect(privateCard.cover_url).toBeNull();
		expect(privateCard.version).toBeNull();

		const workspaceCard = toClaimedTemplateCard({
			...claimedTemplate,
			visibility: "WORKSPACE",
		});
		expect(workspaceCard.isRestricted).toBe(true);
		expect(workspaceCard.canNavigateToPublicDetail).toBe(false);
		expect(workspaceCard.allowDetails).toBe(false);
		expect(workspaceCard.allowUseAttempt).toBe(false);
	});

	it("NAV-10: marks ARCHIVED templates as unavailable for details and use", () => {
		const card = toClaimedTemplateCard({
			...claimedTemplate,
			status: "ARCHIVED",
		});
		expect(card.isArchived).toBe(true);
		expect(card.canNavigateToPublicDetail).toBe(false);
		expect(card.allowDetails).toBe(false);
		expect(card.allowUseAttempt).toBe(false);
		expect(card.statusMessage).toBe("Archived · Unavailable");
	});

	it("disables Use and public detail if published version is absent or has foreign template_id", () => {
		const noVersionCard = toClaimedTemplateCard({
			...claimedTemplate,
			published_version: null,
		});
		expect(noVersionCard.canNavigateToPublicDetail).toBe(false);
		expect(noVersionCard.allowUseAttempt).toBe(false);
		expect(noVersionCard.statusMessage).toBe("No published version available");

		const foreignVersionCard = toClaimedTemplateCard({
			...claimedTemplate,
			published_version: {
				...claimedTemplate.published_version!,
				template_id: "other-template-id",
			},
		});
		expect(foreignVersionCard.canNavigateToPublicDetail).toBe(false);
		expect(foreignVersionCard.allowUseAttempt).toBe(false);
		expect(foreignVersionCard.version).toBeNull();
	});
});
