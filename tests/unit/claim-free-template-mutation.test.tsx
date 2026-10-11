import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { templateApi } from "@/entities/template/api/template.api";
import { useClaimFreeTemplate } from "@/entities/template/model/template.mutations";
import { templateKeys } from "@/entities/template/model/template.queries";
import type { TemplateEntitlementDto } from "@/entities/template/model/template.types";
import { createWrapper } from "../utils/test-utils";

const mockEntitlement: TemplateEntitlementDto = {
	id: "ce93bd7b-32e3-425f-bd3a-6ee617790259",
	template_id: "66bc9bd6-6284-463e-919b-627e9b9e4008",
	user_id: "5d0116ea-e5f2-462d-913e-bb2c2ea26dbc",
	source: "FREE_CLAIM",
	created_at: "2026-10-10T11:36:39.938Z",
};

beforeEach(() => {
	vi.restoreAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("useClaimFreeTemplate mutation", () => {
	it("MUT-01: dispatches to templateApi.claimFreeTemplate with correct templateId (string and object input)", async () => {
		const claimSpy = vi
			.spyOn(templateApi, "claimFreeTemplate")
			.mockResolvedValue(mockEntitlement);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useClaimFreeTemplate(), { wrapper });

		// Test with string input
		await act(async () => {
			await result.current.mutateAsync(mockEntitlement.template_id);
		});
		expect(claimSpy).toHaveBeenLastCalledWith(mockEntitlement.template_id);

		// Test with object input ({ templateId })
		await act(async () => {
			await result.current.mutateAsync({
				templateId: "another-template-id",
			});
		});
		expect(claimSpy).toHaveBeenLastCalledWith("another-template-id");
		expect(claimSpy).toHaveBeenCalledTimes(2);
	});

	it("MUT-02: returns TemplateEntitlementDto on successful claim", async () => {
		vi.spyOn(templateApi, "claimFreeTemplate").mockResolvedValue(
			mockEntitlement,
		);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useClaimFreeTemplate(), { wrapper });

		let mutationResult: TemplateEntitlementDto | undefined;
		await act(async () => {
			mutationResult = await result.current.mutateAsync(
				mockEntitlement.template_id,
			);
		});

		expect(mutationResult).toEqual(mockEntitlement);
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
			expect(result.current.data).toEqual(mockEntitlement);
		});
	});

	it("MUT-03: transitions mutation to error state on backend failure without swallowing error", async () => {
		const backendError = new Error("403 Forbidden: Entitlement required");
		vi.spyOn(templateApi, "claimFreeTemplate").mockRejectedValue(
			backendError,
		);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useClaimFreeTemplate(), { wrapper });

		await act(async () => {
			await expect(
				result.current.mutateAsync("unauthorized-template"),
			).rejects.toThrow("403 Forbidden: Entitlement required");
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
			expect(result.current.error).toBe(backendError);
		});
	});

	it("MUT-04: allows re-claiming idempotently without frontend blocking consecutive requests", async () => {
		const claimSpy = vi
			.spyOn(templateApi, "claimFreeTemplate")
			.mockResolvedValue(mockEntitlement);

		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useClaimFreeTemplate(), { wrapper });

		// First claim
		await act(async () => {
			await result.current.mutateAsync(mockEntitlement.template_id);
		});
		expect(claimSpy).toHaveBeenCalledTimes(1);

		// Second claim (re-claim)
		await act(async () => {
			await result.current.mutateAsync(mockEntitlement.template_id);
		});
		expect(claimSpy).toHaveBeenCalledTimes(2);
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});
	});

	it("MUT-05: does not invalidate unrelated query keys", async () => {
		vi.spyOn(templateApi, "claimFreeTemplate").mockResolvedValue(
			mockEntitlement,
		);

		const { wrapper, queryClient } = createWrapper();

		// Pre-populate queries in cache
		const listKey = templateKeys.lists();
		const publicListKey = templateKeys.publicLists();
		const detailKey = templateKeys.detail(mockEntitlement.template_id);
		const publicDetailKey = templateKeys.publicDetail(
			mockEntitlement.template_id,
		);

		queryClient.setQueryData(listKey, { items: [], nextCursor: null });
		queryClient.setQueryData(publicListKey, { items: [], nextCursor: null });
		queryClient.setQueryData(detailKey, { id: mockEntitlement.template_id });
		queryClient.setQueryData(publicDetailKey, {
			id: mockEntitlement.template_id,
		});

		const { result } = renderHook(() => useClaimFreeTemplate(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync(mockEntitlement.template_id);
		});

		// Verify none of the unrelated keys were invalidated
		expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(false);
		expect(queryClient.getQueryState(publicListKey)?.isInvalidated).toBe(false);
		expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(false);
		expect(queryClient.getQueryState(publicDetailKey)?.isInvalidated).toBe(
			false,
		);
	});
});
