import { afterEach, describe, it, expect, vi } from "vitest";
import instance from "@/shared/api/api-client";
import publicApiClient from "@/shared/api/public-api-client";
import { templateApi } from "@/entities/template/api/template.api";
import { publicTemplate } from "../fixtures/public-template";
import type {
	PublicTemplateListResponse,
	TemplatePreview,
} from "@/entities/template/model/template.types";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("public template API client", () => {
	describe("getPublicById", () => {
		it("calls publicApiClient (not private instance), unwraps data and forwards cancellation", async () => {
			const publicGet = vi
				.spyOn(publicApiClient, "get")
				.mockResolvedValue({
					data: { statusCode: 200, message: "", data: publicTemplate },
				});
			const privateGet = vi.spyOn(instance, "get");
			const signal = new AbortController().signal;

			const result = await templateApi.getPublicById(publicTemplate.id, signal);

			expect(result).toBe(publicTemplate);
			expect(publicGet).toHaveBeenCalledExactlyOnceWith(
				"/public/templates/public-template",
				{ signal },
			);
			expect(privateGet).not.toHaveBeenCalled();
		});

		it("supports unwrapped response convention", async () => {
			vi.spyOn(publicApiClient, "get").mockResolvedValue({
				data: publicTemplate,
			});

			expect(await templateApi.getPublicById(publicTemplate.id)).toBe(
				publicTemplate,
			);
		});

		it("propagates errors without falling back to private client", async () => {
			const error = new Error("not found");
			const publicGet = vi
				.spyOn(publicApiClient, "get")
				.mockRejectedValue(error);
			const privateGet = vi.spyOn(instance, "get");

			await expect(templateApi.getPublicById("unknown")).rejects.toBe(error);
			expect(publicGet).toHaveBeenCalledExactlyOnceWith(
				"/public/templates/unknown",
				{ signal: undefined },
			);
			expect(privateGet).not.toHaveBeenCalled();
		});
	});

	describe("listPublic", () => {
		it("calls publicApiClient with search, cursor, limit params and forwards cancellation", async () => {
			const mockList: PublicTemplateListResponse = {
				items: [publicTemplate],
				nextCursor: "cursor_123",
			};
			const publicGet = vi
				.spyOn(publicApiClient, "get")
				.mockResolvedValue({
					data: { statusCode: 200, message: "OK", data: mockList },
				});
			const privateGet = vi.spyOn(instance, "get");
			const signal = new AbortController().signal;

			const result = await templateApi.listPublic(
				{ search: "sprint", cursor: "prev_cursor", limit: 10 },
				signal,
			);

			expect(result).toEqual(mockList);
			expect(publicGet).toHaveBeenCalledExactlyOnceWith("/public/templates", {
				params: {
					search: "sprint",
					cursor: "prev_cursor",
					limit: 10,
				},
				signal,
			});
			expect(privateGet).not.toHaveBeenCalled();
		});

		it("defaults limit to 20 and omits undefined search/cursor", async () => {
			const mockList: PublicTemplateListResponse = {
				items: [],
				nextCursor: null,
			};
			const publicGet = vi
				.spyOn(publicApiClient, "get")
				.mockResolvedValue({
					data: mockList,
				});

			const result = await templateApi.listPublic({});

			expect(result).toEqual(mockList);
			expect(publicGet).toHaveBeenCalledExactlyOnceWith("/public/templates", {
				params: {
					search: undefined,
					cursor: undefined,
					limit: 20,
				},
				signal: undefined,
			});
		});
	});

	describe("getPublicPreview", () => {
		it("calls publicApiClient with preview path, forwards cancellation and unwraps data", async () => {
			const mockPreview: TemplatePreview = {
				template: publicTemplate,
				version: publicTemplate.version!,
				blocks: [],
				databases: [],
			};
			const publicGet = vi
				.spyOn(publicApiClient, "get")
				.mockResolvedValue({
					data: { statusCode: 200, message: "OK", data: mockPreview },
				});
			const privateGet = vi.spyOn(instance, "get");
			const signal = new AbortController().signal;

			const result = await templateApi.getPublicPreview(
				"template-1",
				"version-2",
				signal,
			);

			expect(result).toEqual(mockPreview);
			expect(publicGet).toHaveBeenCalledExactlyOnceWith(
				"/public/templates/template-1/versions/version-2/preview",
				{ signal },
			);
			expect(privateGet).not.toHaveBeenCalled();
		});
	});

	describe("private APIs regression check", () => {
		it("ensures private endpoints continue using instance (private client)", async () => {
			const privateGet = vi
				.spyOn(instance, "get")
				.mockResolvedValue({
					data: { statusCode: 200, message: "OK", data: publicTemplate },
				});
			const publicGet = vi.spyOn(publicApiClient, "get");
			const signal = new AbortController().signal;

			const result = await templateApi.getById("template-private", signal);

			expect(result).toEqual(publicTemplate);
			expect(privateGet).toHaveBeenCalledExactlyOnceWith(
				"/templates/template-private",
				{ signal },
			);
			expect(publicGet).not.toHaveBeenCalled();
		});
	});
});

