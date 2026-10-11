import { afterEach, describe, expect, it, vi } from "vitest";
import instance from "@/shared/api/api-client";
import publicApiClient from "@/shared/api/public-api-client";
import { templateApi } from "@/entities/template";
import { claimedTemplate } from "../fixtures/claimed-template";

afterEach(() => vi.restoreAllMocks());
describe("My claimed templates API", () => {
	it.each([true, false])(
		"unwraps the actual DTO using authenticated Axios (envelope=%s)",
		async (envelope) => {
			const data = { items: [claimedTemplate], nextCursor: "next-page" };
			const get = vi
				.spyOn(instance, "get")
				.mockResolvedValue({
					data: envelope ? { statusCode: 200, data } : data,
				});
			const publicGet = vi.spyOn(publicApiClient, "get");
			const signal = new AbortController().signal;
			expect(await templateApi.listMyClaimedTemplates({}, signal)).toEqual(
				data,
			);
			expect(get).toHaveBeenCalledWith("/templates/me/claimed", {
				params: { limit: 20, cursor: undefined },
				signal,
			});
			expect(publicGet).not.toHaveBeenCalled();
		},
	);
	it("sends only limit/cursor and propagates errors", async () => {
		const get = vi
			.spyOn(instance, "get")
			.mockRejectedValue(new Error("Unauthorized"));
		await expect(
			templateApi.listMyClaimedTemplates({ cursor: "next-page", limit: 100 }),
		).rejects.toThrow("Unauthorized");
		expect(get).toHaveBeenCalledWith("/templates/me/claimed", {
			params: { limit: 100, cursor: "next-page" },
			signal: undefined,
		});
	});
});
