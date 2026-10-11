import { afterEach, describe, it, expect, vi } from "vitest";
import instance from "@/shared/api/api-client";
import publicApiClient from "@/shared/api/public-api-client";
import { templateApi } from "@/entities/template/api/template.api";
import type { TemplateListingDto } from "@/entities/template/model/template.types";

const mockListing: TemplateListingDto = {
	id: "listing-101",
	template_id: "template-202",
	offer_type: "FREE",
	status: "DRAFT",
	created_by: "creator-uuid",
	published_at: null,
	created_at: "2026-10-10T10:00:00.000Z",
	updated_at: "2026-10-10T10:00:00.000Z",
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("templateApi listing endpoints", () => {
	it("one-click publish uses private Axios with selected version and FREE payload", async () => {
		const result = { listing: { ...mockListing, published_version_id: "version-1" } };
		const post = vi.spyOn(instance, "post").mockResolvedValue({ data: { data: result } });
		const publicPost = vi.spyOn(publicApiClient, "post");
		const payload = { version_id: "version-1", offer_type: "FREE" as const };
		expect(await templateApi.publishToMarketplace("template-202", payload)).toEqual(result);
		expect(post).toHaveBeenCalledExactlyOnceWith("/templates/template-202/marketplace/publish", payload);
		expect(publicPost).not.toHaveBeenCalled();
	});
	it("API-01: getListing calls GET /templates/:id/listing using private instance", async () => {
		const getSpy = vi.spyOn(instance, "get").mockResolvedValue({
			data: {
				statusCode: 200,
				message: "Success",
				data: mockListing,
			},
		});
		const publicGetSpy = vi.spyOn(publicApiClient, "get");

		const result = await templateApi.getListing(mockListing.template_id);

		expect(result).toEqual(mockListing);
		expect(getSpy).toHaveBeenCalledWith(
			`/templates/${mockListing.template_id}/listing`,
			{ signal: undefined },
		);
		expect(publicGetSpy).not.toHaveBeenCalled();
	});

	it("API-02: createListing calls POST /templates/:id/listing without extra body", async () => {
		const postSpy = vi.spyOn(instance, "post").mockResolvedValue({
			data: {
				statusCode: 201,
				message: "Listing created",
				data: mockListing,
			},
		});

		const result = await templateApi.createListing(mockListing.template_id);

		expect(result).toEqual(mockListing);
		expect(postSpy).toHaveBeenCalledWith(
			`/templates/${mockListing.template_id}/listing`,
		);
	});

	it("API-03: publishListing calls POST /templates/:id/listing/publish", async () => {
		const publishedListing: TemplateListingDto = {
			...mockListing,
			status: "PUBLISHED",
			published_at: "2026-10-10T11:00:00.000Z",
		};
		const postSpy = vi.spyOn(instance, "post").mockResolvedValue({
			data: {
				statusCode: 200,
				message: "Listing published",
				data: publishedListing,
			},
		});

		const result = await templateApi.publishListing(mockListing.template_id);

		expect(result).toEqual(publishedListing);
		expect(postSpy).toHaveBeenCalledWith(
			`/templates/${mockListing.template_id}/listing/publish`,
		);
	});

	it("API-04: unpublishListing calls POST /templates/:id/listing/unPublish with capital P", async () => {
		const unpublishedListing: TemplateListingDto = {
			...mockListing,
			status: "DRAFT",
		};
		const postSpy = vi.spyOn(instance, "post").mockResolvedValue({
			data: {
				statusCode: 200,
				message: "Listing unpublished",
				data: unpublishedListing,
			},
		});

		const result = await templateApi.unpublishListing(mockListing.template_id);

		expect(result).toEqual(unpublishedListing);
		expect(postSpy).toHaveBeenCalledWith(
			`/templates/${mockListing.template_id}/listing/unPublish`,
		);
	});

	it("API-05: propagates errors without swallowing them", async () => {
		vi.spyOn(instance, "get").mockRejectedValue(new Error("Network Error"));

		await expect(templateApi.getListing("unknown-tpl")).rejects.toThrow(
			"Network Error",
		);
	});
});
