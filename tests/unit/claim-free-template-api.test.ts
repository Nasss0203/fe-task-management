import { afterEach, describe, it, expect, vi } from "vitest";
import instance from "@/shared/api/api-client";
import publicApiClient from "@/shared/api/public-api-client";
import { templateApi } from "@/entities/template/api/template.api";
import type {
	ApiResponse,
} from "@/shared/api";
import type {
	TemplateEntitlementDto,
	PublicTemplateListResponse,
	TemplatePreview,
} from "@/entities/template/model/template.types";
import { publicTemplate } from "../fixtures/public-template";

const mockEntitlement: TemplateEntitlementDto = {
	id: "ce93bd7b-32e3-425f-bd3a-6ee617790259",
	template_id: "66bc9bd6-6284-463e-919b-627e9b9e4008",
	user_id: "5d0116ea-e5f2-462d-913e-bb2c2ea26dbc",
	source: "FREE_CLAIM",
	created_at: "2026-10-10T11:36:39.938Z",
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("claimFreeTemplate API", () => {
	it("API-01: calls POST /templates/:templateId/claim with valid templateId", async () => {
		const privatePost = vi
			.spyOn(instance, "post")
			.mockResolvedValue({
				data: {
					statusCode: 201,
					message: "Template claimed successfully",
					data: mockEntitlement,
				},
			});

		const result = await templateApi.claimFreeTemplate(mockEntitlement.template_id);

		expect(result).toEqual(mockEntitlement);
		expect(privatePost).toHaveBeenCalledWith(
			`/templates/${mockEntitlement.template_id}/claim`,
		);
	});

	it("API-02: uses private Axios instance and never uses publicApiClient", async () => {
		const privatePost = vi
			.spyOn(instance, "post")
			.mockResolvedValue({
				data: {
					statusCode: 201,
					message: "Template claimed successfully",
					data: mockEntitlement,
				},
			});
		const publicPost = vi.spyOn(publicApiClient, "post");
		const publicGet = vi.spyOn(publicApiClient, "get");

		await templateApi.claimFreeTemplate("template-xyz");

		expect(privatePost).toHaveBeenCalledOnce();
		expect(publicPost).not.toHaveBeenCalled();
		expect(publicGet).not.toHaveBeenCalled();
	});

	it("API-03: does not send request body, userId, or unnecessary payload", async () => {
		const privatePost = vi
			.spyOn(instance, "post")
			.mockResolvedValue({
				data: {
					statusCode: 201,
					message: "Template claimed successfully",
					data: mockEntitlement,
				},
			});

		await templateApi.claimFreeTemplate("template-123");

		expect(privatePost).toHaveBeenCalledOnce();
		const callArgs = privatePost.mock.calls[0];
		expect(callArgs[0]).toBe("/templates/template-123/claim");
		// Verify no request body (2nd argument) is sent
		expect(callArgs[1]).toBeUndefined();
	});

	it("API-04: unwraps ApiResponse correctly and also supports pre-unwrapped response", async () => {
		const apiResponseWrapper: ApiResponse<TemplateEntitlementDto> = {
			statusCode: 201,
			message: "Template claimed successfully",
			data: mockEntitlement,
		};

		vi.spyOn(instance, "post").mockResolvedValueOnce({
			data: apiResponseWrapper,
		});

		const result1 = await templateApi.claimFreeTemplate(mockEntitlement.template_id);
		expect(result1).toEqual(mockEntitlement);

		// Also verify unwrap handling if response is directly the entitlement object
		vi.spyOn(instance, "post").mockResolvedValueOnce({
			data: mockEntitlement,
		});

		const result2 = await templateApi.claimFreeTemplate(mockEntitlement.template_id);
		expect(result2).toEqual(mockEntitlement);
	});

	it("API-05: rejects on backend errors without converting to success", async () => {
		const error403 = new Error("403 Forbidden - Already claimed or not authorized");
		vi.spyOn(instance, "post").mockRejectedValue(error403);

		await expect(
			templateApi.claimFreeTemplate("forbidden-template"),
		).rejects.toThrow("403 Forbidden - Already claimed or not authorized");
	});

	it("API-06: ensures public APIs (listPublic, getPublicById, getPublicPreview) regressively use publicApiClient", async () => {
		const publicGet = vi.spyOn(publicApiClient, "get");
		const privateGet = vi.spyOn(instance, "get");

		// 1. listPublic
		const mockList: PublicTemplateListResponse = {
			items: [publicTemplate],
			nextCursor: null,
		};
		publicGet.mockResolvedValueOnce({
			data: { statusCode: 200, message: "OK", data: mockList },
		});
		await templateApi.listPublic({});
		expect(publicGet).toHaveBeenLastCalledWith("/public/templates", {
			params: { search: undefined, cursor: undefined, limit: 20 },
			signal: undefined,
		});

		// 2. getPublicById
		publicGet.mockResolvedValueOnce({
			data: { statusCode: 200, message: "OK", data: publicTemplate },
		});
		await templateApi.getPublicById("pub-1");
		expect(publicGet).toHaveBeenLastCalledWith("/public/templates/pub-1", {
			signal: undefined,
		});

		// 3. getPublicPreview
		const mockPreview: TemplatePreview = {
			template: publicTemplate,
			version: publicTemplate.version,
			blocks: [],
			databases: [],
		};
		publicGet.mockResolvedValueOnce({
			data: { statusCode: 200, message: "OK", data: mockPreview },
		});
		await templateApi.getPublicPreview("pub-1", "ver-1");
		expect(publicGet).toHaveBeenLastCalledWith(
			"/public/templates/pub-1/versions/ver-1/preview",
			{ signal: undefined },
		);

		// None of these public APIs should touch private instance.get
		expect(privateGet).not.toHaveBeenCalled();
	});
});
