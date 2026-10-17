import { z } from "zod";

import type {
	PageTemplate,
	TemplateDemoConfig,
	TemplateListingDto,
	TemplateVersion,
	UpdateTemplateListingPayload,
} from "@/entities/template";

/** Backend cap for rows shown per database in a LIMITED demo. */
export const DEMO_MAX_ROWS = 20;

const demoDatabaseRulesSchema = z.object({
	view_ids: z.array(z.string()),
	property_ids: z.array(z.string()),
	row_limit: z.number().int().min(0).max(DEMO_MAX_ROWS).optional(),
	row_ids: z.array(z.string()).optional(),
});

export type DemoDatabaseRules = z.infer<typeof demoDatabaseRulesSchema>;

export const listingFormSchema = z
	.object({
		name: z.string().trim().min(1, "Template name is required."),
		description: z.string(),
		offer_type: z.enum(["FREE", "PAID"]),
		/** Digits only; kept as a string so an empty field is representable. */
		price: z.string(),
		preview_mode: z.enum(["IMAGE", "INTERACTIVE"]),
		/** SEPARATE: a whole demo version is public. LIMITED: only allowlisted content. */
		demo_mode: z.enum(["SEPARATE", "LIMITED"]),
		demo_version_id: z.string(),
		demo_block_ids: z.array(z.string()),
		demo_databases: z.record(z.string(), demoDatabaseRulesSchema),
	})
	.superRefine((values, ctx) => {
		if (values.offer_type !== "PAID") return;

		const amount = Number(values.price);
		if (!values.price || !Number.isSafeInteger(amount) || amount <= 0) {
			ctx.addIssue({
				code: "custom",
				path: ["price"],
				message: "Enter a price greater than 0.",
			});
		}
		if (values.preview_mode !== "INTERACTIVE") return;

		// Backend refuses an interactive preview of a paid template without a demo version.
		if (!values.demo_version_id) {
			ctx.addIssue({
				code: "custom",
				path: ["demo_version_id"],
				message: "Choose a version for the live demo.",
			});
		}
		if (values.demo_mode === "LIMITED" && values.demo_block_ids.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["demo_block_ids"],
				message: "Choose at least one block to show in the demo.",
			});
		}
	});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export const LISTING_FIELDS = [
	"offer_type",
	"price",
	"preview_mode",
	"demo_mode",
	"demo_version_id",
	"demo_block_ids",
	"demo_databases",
] as const satisfies readonly (keyof ListingFormValues)[];

export const TEMPLATE_FIELDS = [
	"name",
	"description",
] as const satisfies readonly (keyof ListingFormValues)[];

export function isLimitedDemoConfig(raw: unknown): boolean {
	return readLimitedConfig(raw) !== null;
}

function readLimitedConfig(raw: unknown): TemplateDemoConfig | null {
	if (typeof raw !== "object" || raw === null) return null;
	const config = raw as Partial<TemplateDemoConfig>;
	return config.schema === 1 && config.scope === "LIMITED"
		? (config as TemplateDemoConfig)
		: null;
}

export function toListingFormValues(
	template: PageTemplate,
	listing?: TemplateListingDto | null,
	publishedVersions: Pick<TemplateVersion, "id" | "version_number">[] = [],
): ListingFormValues {
	// Default demo source: the version on sale, else the newest published one.
	// Part of the defaults, so it never shows up as an unsaved change.
	const newestPublished = publishedVersions.reduce<
		Pick<TemplateVersion, "id" | "version_number"> | undefined
	>(
		(newest, version) =>
			!newest || version.version_number > newest.version_number ? version : newest,
		undefined,
	);
	const offerType = listing?.offer_type ?? "FREE";
	const limited = readLimitedConfig(listing?.demo_config);

	return {
		name: template.name,
		description: template.description ?? "",
		offer_type: offerType,
		price: listing?.price_amount ? String(listing.price_amount) : "",
		// Mirrors the backend default: paid listings start as IMAGE, free as INTERACTIVE.
		preview_mode:
			listing?.preview_mode ?? (offerType === "PAID" ? "IMAGE" : "INTERACTIVE"),
		// Without a saved demo, start with LIMITED: it never blocks releasing the
		// only published version (a separate demo version can't be sold).
		demo_mode: limited || !listing?.demo_version_id ? "LIMITED" : "SEPARATE",
		demo_version_id:
			listing?.demo_version_id ??
			listing?.published_version_id ??
			newestPublished?.id ??
			"",
		demo_block_ids: limited?.block_ids ?? [],
		demo_databases: limited?.databases ?? {},
	};
}

/** The LIMITED config to store or preview, or null for a separate demo version. */
export function toDemoConfig(values: ListingFormValues): TemplateDemoConfig | null {
	if (values.demo_mode !== "LIMITED") return null;

	const databases: TemplateDemoConfig["databases"] = {};
	for (const [databaseId, rules] of Object.entries(values.demo_databases)) {
		// A database needs a visible view; entries without one are left out.
		if (rules.view_ids.length === 0) continue;
		databases[databaseId] = {
			view_ids: rules.view_ids,
			property_ids: rules.property_ids,
			...(rules.row_ids
				? { row_ids: rules.row_ids }
				: { row_limit: rules.row_limit ?? 0 }),
		};
	}

	return {
		schema: 1,
		scope: "LIMITED",
		block_ids: values.demo_block_ids,
		databases,
	};
}

export function toListingPayload(
	values: ListingFormValues,
): UpdateTemplateListingPayload {
	const isPaid = values.offer_type === "PAID";
	const hasDemo =
		isPaid && values.preview_mode === "INTERACTIVE" && values.demo_version_id;

	return {
		offer_type: values.offer_type,
		price_amount: isPaid ? Number(values.price) : 0,
		currency: "VND",
		preview_mode: values.preview_mode,
		// Demo versions only matter for paid live previews.
		...(hasDemo
			? {
					demo_version_id: values.demo_version_id,
					demo_config: toDemoConfig(values),
				}
			: {}),
	};
}

export { formatVnd } from "@/shared/lib/currency";
