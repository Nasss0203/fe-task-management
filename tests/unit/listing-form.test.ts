import { describe, expect, it } from "vitest";

import type {
	PageTemplate,
	TemplateListingDto,
} from "@/entities/template/model/template.types";
import {
	isLimitedDemoConfig,
	listingFormSchema,
	toDemoConfig,
	toListingFormValues,
	toListingPayload,
	type ListingFormValues,
} from "@/widgets/creator-templates/model/listing-form";
import { getListingState } from "@/widgets/creator-templates/model/listing-state";

const template: PageTemplate = {
	id: "tpl-1",
	source_page_id: null,
	workspace_id: "ws-1",
	name: "Roadmap",
	description: null,
	icon: null,
	cover_url: null,
	created_by: "user-1",
	status: "PUBLISHED",
	visibility: "PUBLIC",
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-01T00:00:00.000Z",
};

const listing: TemplateListingDto = {
	id: "l-1",
	template_id: "tpl-1",
	offer_type: "PAID",
	price_amount: 99000,
	currency: "VND",
	preview_mode: "INTERACTIVE",
	demo_version_id: "ver-1",
	status: "PUBLISHED",
	published_version_id: "ver-2",
	created_by: "user-1",
	published_at: "2026-10-02T00:00:00.000Z",
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-02T00:00:00.000Z",
};

const base: ListingFormValues = {
	name: "Roadmap",
	description: "",
	offer_type: "FREE",
	price: "",
	preview_mode: "INTERACTIVE",
	demo_mode: "SEPARATE",
	demo_version_id: "",
	demo_block_ids: [],
	demo_databases: {},
};

describe("listing form", () => {
	it("defaults to a free interactive listing when none exists", () => {
		// New demos start as LIMITED so the only published version stays sellable.
		expect(toListingFormValues(template, null)).toEqual({
			...base,
			demo_mode: "LIMITED",
		});
	});

	it("hydrates paid listing values from the backend", () => {
		expect(toListingFormValues(template, listing)).toMatchObject({
			offer_type: "PAID",
			price: "99000",
			demo_version_id: "ver-1",
		});
	});

	it("requires a positive price and a demo for paid live previews", () => {
		const result = listingFormSchema.safeParse({
			...base,
			offer_type: "PAID",
			price: "0",
		});
		expect(result.success).toBe(false);
		const paths = result.error?.issues.map((issue) => issue.path[0]);
		expect(paths).toEqual(["price", "demo_version_id"]);
	});

	it("accepts a free listing without a price", () => {
		expect(listingFormSchema.safeParse(base).success).toBe(true);
	});

	it("sends price 0 for free and omits the demo version", () => {
		expect(toListingPayload({ ...base, demo_version_id: "ver-1" })).toEqual({
			offer_type: "FREE",
			price_amount: 0,
			currency: "VND",
			preview_mode: "INTERACTIVE",
		});
	});

	it("sends the demo version only for paid live previews", () => {
		const paid = { ...base, offer_type: "PAID" as const, price: "99000" };
		expect(toListingPayload({ ...paid, demo_version_id: "ver-1" })).toEqual({
			offer_type: "PAID",
			price_amount: 99000,
			currency: "VND",
			preview_mode: "INTERACTIVE",
			demo_version_id: "ver-1",
			// A separate demo clears any stale LIMITED config.
			demo_config: null,
		});
		expect(
			toListingPayload({ ...paid, preview_mode: "IMAGE", demo_version_id: "ver-1" }),
		).not.toHaveProperty("demo_version_id");
	});
});

describe("limited demo", () => {
	const B1 = "00000000-0000-4000-8000-000000000001";
	const DB = "00000000-0000-4000-8000-000000000020";
	const VIEW = "00000000-0000-4000-8000-000000000021";
	const limited: ListingFormValues = {
		...base,
		offer_type: "PAID",
		price: "99000",
		demo_mode: "LIMITED",
		demo_version_id: "ver-2",
		demo_block_ids: [B1],
		demo_databases: {
			[DB]: { view_ids: [VIEW], property_ids: [], row_limit: 3 },
			"db-without-view": { view_ids: [], property_ids: [], row_limit: 1 },
		},
	};

	it("requires at least one visible block", () => {
		const result = listingFormSchema.safeParse({ ...limited, demo_block_ids: [] });
		expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
			"demo_block_ids",
		]);
	});

	it("builds a schema-1 LIMITED config and drops databases without views", () => {
		expect(toDemoConfig(limited)).toEqual({
			schema: 1,
			scope: "LIMITED",
			block_ids: [B1],
			databases: { [DB]: { view_ids: [VIEW], property_ids: [], row_limit: 3 } },
		});
		expect(toDemoConfig({ ...limited, demo_mode: "SEPARATE" })).toBeNull();
	});

	it("sends the LIMITED config with the demo version", () => {
		expect(toListingPayload(limited)).toMatchObject({
			demo_version_id: "ver-2",
			demo_config: { scope: "LIMITED", block_ids: [B1] },
		});
	});

	it("hydrates a stored LIMITED config back into the form", () => {
		const config = toDemoConfig(limited);
		const values = toListingFormValues(template, {
			...listing,
			demo_version_id: "ver-2",
			demo_config: config as unknown as Record<string, unknown>,
		});
		expect(values).toMatchObject({
			demo_mode: "LIMITED",
			demo_block_ids: [B1],
			demo_databases: config!.databases,
		});
		expect(isLimitedDemoConfig(config)).toBe(true);
		expect(isLimitedDemoConfig({ sandbox: true })).toBe(false);
	});
});

describe("listing state", () => {
	it("is live only when published, public and not archived", () => {
		expect(getListingState(template, listing)).toBe("LIVE");
		expect(
			getListingState({ ...template, visibility: "PRIVATE" }, listing),
		).toBe("UNPUBLISHED");
		expect(getListingState(template, { ...listing, status: "DRAFT" })).toBe(
			"UNPUBLISHED",
		);
		expect(
			getListingState(template, {
				...listing,
				status: "DRAFT",
				published_version_id: null,
			}),
		).toBe("DRAFT");
		expect(getListingState(template, null)).toBe("NOT_LISTED");
	});
});
