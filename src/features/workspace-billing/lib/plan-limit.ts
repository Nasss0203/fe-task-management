import axios from "axios";

import type { BillingPlan } from "@/entities/billing/model/billing.types";

export const PLAN_LIMIT_ERROR_CODE = "WORKSPACE_LIMIT_EXCEEDED";

export interface PlanLimitError {
	feature: string;
	limit: number | boolean;
}

export type PlanLimitAction = "upgrade" | "manage-storage" | null;

export interface PlanLimitNotice {
	title: string;
	description: string;
	action: PlanLimitAction;
	actionLabel: string | null;
}

const LIMIT_COPY: Record<string, { title: string; unit: (count: number) => string }> = {
	MAX_MEMBERS: {
		title: "Member limit reached",
		unit: (count) => (count === 1 ? "member" : "members"),
	},
	MAX_TEAMSPACES: {
		title: "Teamspace limit reached",
		unit: (count) => (count === 1 ? "teamspace" : "teamspaces"),
	},
	MAX_STORAGE_MB: {
		title: "Storage limit reached",
		unit: () => "of storage",
	},
};

export function formatMegabytes(megabytes: number): string {
	return megabytes >= 1024
		? `${Number((megabytes / 1024).toFixed(1))} GB`
		: `${Number(megabytes.toFixed(1))} MB`;
}

export function getPlanLimitError(error: unknown): PlanLimitError | null {
	if (!axios.isAxiosError<{ code?: string; details?: Partial<PlanLimitError> }>(error)) {
		return null;
	}
	const data = error.response?.data;
	if (data?.code !== PLAN_LIMIT_ERROR_CODE || typeof data.details?.feature !== "string") {
		return null;
	}
	const limit = data.details.limit;
	return {
		feature: data.details.feature,
		limit: typeof limit === "number" || typeof limit === "boolean" ? limit : false,
	};
}

export function isPlanLimitError(error: unknown): boolean {
	return getPlanLimitError(error) !== null;
}

interface PlanOffer {
	name: string;
	value: number | boolean;
}

export function findUpgradePlan(
	plans: BillingPlan[] | undefined,
	feature: string,
	limit: number | boolean,
): PlanOffer | null {
	const offers = (plans ?? []).flatMap((plan) =>
		plan.features
			.filter((planFeature) => planFeature.code === feature)
			.map((planFeature) => ({ name: plan.name, value: planFeature.value })),
	);
	if (typeof limit === "boolean") {
		return limit ? null : (offers.find((offer) => offer.value === true) ?? null);
	}
	return offers
		.filter((offer): offer is { name: string; value: number } =>
			typeof offer.value === "number" && offer.value > limit,
		)
		.reduce<PlanOffer | null>(
			(closest, offer) =>
				closest === null || offer.value < (closest.value as number) ? offer : closest,
			null,
		);
}

export function hasHigherPlanLimit(
	plans: BillingPlan[] | undefined,
	feature: string,
	limit: number | boolean,
): boolean {
	return !plans || findUpgradePlan(plans, feature, limit) !== null;
}

function formatAmount(feature: string, value: number): string {
	if (feature === "MAX_STORAGE_MB") return formatMegabytes(value);
	const unit = LIMIT_COPY[feature]?.unit(value);
	return unit ? `${value.toLocaleString("en-US")} ${unit}` : value.toLocaleString("en-US");
}

export function describePlanLimit(
	limitError: PlanLimitError,
	plans: BillingPlan[] | undefined,
	canManageBilling: boolean | undefined,
): PlanLimitNotice {
	const { feature, limit } = limitError;
	const isPublishing = typeof limit === "boolean";
	const title = isPublishing
		? "Publishing isn't included in your plan"
		: (LIMIT_COPY[feature]?.title ?? "Plan limit reached");
	const current = isPublishing ? "" : `Your plan includes ${formatAmount(feature, limit)}. `;
	const base = { title };

	if (hasHigherPlanLimit(plans, feature, limit)) {
		const offer = findUpgradePlan(plans, feature, limit);
		const gain = !offer
			? "get more"
			: isPublishing
				? "publish pages to the web"
				: `get up to ${formatAmount(feature, offer.value as number)}`;
		const target = offer ? offer.name : "a higher plan";

		if (canManageBilling === false) {
			return {
				...base,
				description: `${current}Only workspace owners can change the plan. Ask an owner to upgrade to ${target} to ${gain}.`,
				action: null,
				actionLabel: null,
			};
		}
		return {
			...base,
			description: `${current}Upgrade to ${target} to ${gain}.`,
			action: canManageBilling ? "upgrade" : null,
			actionLabel: canManageBilling ? (offer ? `Upgrade to ${offer.name}` : "Upgrade") : null,
		};
	}

	if (feature === "MAX_STORAGE_MB") {
		return {
			...base,
			description: `${current}This is the highest storage available. Delete files you no longer need to free up space.`,
			action: "manage-storage",
			actionLabel: "Manage storage",
		};
	}
	return {
		...base,
		description: `${current}This is the highest limit available on any plan.`,
		action: null,
		actionLabel: null,
	};
}
