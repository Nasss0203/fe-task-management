import type {
	BillingCycle,
	BillingPayment,
	BillingPlan,
	PaymentStatus,
	PlanBillingInterval,
	PlanStatus,
	SubscriptionStatus,
	WorkspaceSubscription,
} from "@/components/admin/shared/billing-admin.types";

type BillingRecord = Record<string, unknown>;

export type AdminBillingPayment = BillingPayment & {
	subscriptionId?: string | null;
	planId?: string | null;
	workspaceId?: string | null;
};

const isRecord = (value: unknown): value is BillingRecord =>
	typeof value === "object" && value !== null;

const getRecord = (source: BillingRecord, key: string): BillingRecord | null => {
	const value = source[key];
	return isRecord(value) ? value : null;
};

const getString = (
	source: BillingRecord,
	keys: string[],
	fallback = "",
): string => {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "string") return value;
		if (typeof value === "number") return String(value);
	}
	return fallback;
};

const getNullableString = (
	source: BillingRecord,
	keys: string[],
): string | null => {
	const value = getString(source, keys);
	return value || null;
};

const getNumber = (
	source: BillingRecord,
	keys: string[],
	fallback = 0,
): number => {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "number") return value;
		if (typeof value === "string" && value.trim() !== "") {
			const parsed = Number(value);
			if (!Number.isNaN(parsed)) return parsed;
		}
	}
	return fallback;
};

const getDateString = (
	source: BillingRecord,
	keys: string[],
	fallback = new Date().toISOString(),
): string => {
	const value = getString(source, keys);
	return value || fallback;
};

const getArray = <T = unknown>(source: BillingRecord, keys: string[]): T[] => {
	for (const key of keys) {
		const value = source[key];
		if (Array.isArray(value)) return value as T[];
	}
	return [];
};

const getJsonRecord = (
	source: BillingRecord,
	keys: string[],
): BillingRecord | null => {
	for (const key of keys) {
		const value = source[key];
		if (isRecord(value)) return value;
	}
	return null;
};

const normalizeCode = (value: string) =>
	value.replace(/[-\s]+/g, "_").toUpperCase();

const normalizePlanStatus = (source: BillingRecord): PlanStatus => {
	const rawStatus = getString(source, ["status"]);
	if (rawStatus === "ACTIVE" || rawStatus === "DISABLED" || rawStatus === "DRAFT") {
		return rawStatus;
	}

	if (typeof source.isActive === "boolean") {
		return source.isActive ? "ACTIVE" : "DISABLED";
	}

	return "ACTIVE";
};

const normalizeBillingCycle = (source: BillingRecord): BillingCycle => {
	const rawCycle = getString(source, [
		"billingCycle",
		"billingInterval",
		"interval",
	]).toUpperCase();

	if (rawCycle === "YEAR" || rawCycle === "YEARLY") return "YEARLY";
	return "MONTHLY";
};

const normalizePlanBillingInterval = (
	source: BillingRecord,
): PlanBillingInterval => {
	const rawCycle = getString(source, [
		"billingInterval",
		"billingCycle",
		"interval",
	]).toUpperCase();

	if (rawCycle === "YEAR" || rawCycle === "YEARLY") return "YEAR";
	if (rawCycle === "LIFETIME") return "LIFETIME";
	return "MONTH";
};

const normalizeSubscriptionStatus = (
	source: BillingRecord,
): SubscriptionStatus => {
	const rawStatus = getString(source, ["status"]).toUpperCase();

	if (rawStatus === "TRIAL" || rawStatus === "TRIALING") return "TRIAL";
	if (rawStatus === "CANCELLED" || rawStatus === "CANCELED") return "CANCELED";
	if (rawStatus === "EXPIRED" || rawStatus === "PAST_DUE") return "EXPIRED";
	return "ACTIVE";
};

const normalizePaymentStatus = (source: BillingRecord): PaymentStatus => {
	const rawStatus = getString(source, ["status"]).toUpperCase();

	if (rawStatus === "SUCCEEDED" || rawStatus === "SUCCESS" || rawStatus === "PAID") {
		return "PAID";
	}

	if (rawStatus === "FAILED") return "FAILED";
	if (rawStatus === "REFUNDED") return "REFUNDED";
	return "PENDING";
};

const normalizeFeatures = (source: BillingRecord): string[] => {
	const directFeatures = getArray<string>(source, ["features"]);
	if (directFeatures.length) return directFeatures.map(String);

	const features = getJsonRecord(source, ["features"]);
	if (!features) return [];

	return Object.entries(features)
		.filter(([, enabled]) => Boolean(enabled))
		.map(([feature]) => feature);
};

const getLimit = (
	limits: BillingRecord | null,
	keys: string[],
	fallback: number,
) => {
	if (!limits) return fallback;
	return getNumber(limits, keys, fallback);
};

export const normalizeAdminBillingPlan = (item: unknown): BillingPlan => {
	const source = isRecord(item) ? item : {};
	const limits = getJsonRecord(source, ["limits"]);
	const billingCycle = normalizeBillingCycle(source);
	const billingInterval = normalizePlanBillingInterval(source);
	const price = getNumber(source, ["priceAmount", "price", "amount"]);
	const code = getString(source, ["code", "slug", "id"], "PLAN");
	const storageMb = getLimit(limits, ["storageMb"], 0);

	return {
		id: getString(source, ["id"], code),
		name: getString(source, ["name"], code),
		code: normalizeCode(code),
		slug: getString(source, ["slug", "code"], code),
		description: getString(source, ["description"]),
		status: normalizePlanStatus(source),
		priceAmount: price,
		currency: getString(source, ["currency"], "VND"),
		billingInterval,
		sortOrder: getNumber(source, ["sortOrder"]),
		monthlyPrice: billingCycle === "MONTHLY" ? price : getNumber(source, ["monthlyPrice"]),
		yearlyPrice: billingCycle === "YEARLY" ? price : getNumber(source, ["yearlyPrice"]),
		workspaceLimit: getLimit(limits, ["upgradedWorkspaces", "workspaces"], 1),
		membersLimit: getLimit(limits, ["members", "membersLimit"], 5),
		projectsLimit: getLimit(limits, ["projects", "projectsLimit"], 5),
		storageLimitGb: Math.round(
			getLimit(limits, ["storageGb", "storageLimitGb"], 0) ||
				(storageMb || 5120) / 1024,
		),
		features: normalizeFeatures(source),
		trialDays: getNumber(source, ["trialDays", "trialPeriodDays"]),
		activeSubscriptions: getNumber(source, [
			"activeSubscriptions",
			"subscriptionsCount",
			"activeSubscriptionCount",
		]),
		updatedAt: getDateString(source, ["updatedAt", "createdAt"]),
	};
};

export const normalizeAdminBillingPayment = (
	item: unknown,
): AdminBillingPayment => {
	const source = isRecord(item) ? item : {};
	const invoice = getRecord(source, "invoice");
	const plan = getRecord(source, "plan");
	const workspace = getRecord(source, "targetWorkspace");

	return {
		id: getString(source, ["id", "orderCode"], crypto.randomUUID()),
		invoiceNo:
			getString(source, ["invoiceNo", "orderCode", "providerOrderId"]) ||
			getString(invoice ?? {}, ["invoiceNo", "code"], "-"),
		amount: getNumber(source, ["amount"]),
		status: normalizePaymentStatus(source),
		paidAt: getDateString(source, ["paidAt", "createdAt"]),
		subscriptionId: getNullableString(source, ["subscriptionId"]),
		planId: getNullableString(source, ["planId"]) ?? getNullableString(plan ?? {}, ["id"]),
		workspaceId:
			getNullableString(source, ["workspaceId", "targetWorkspaceId"]) ??
			getNullableString(workspace ?? {}, ["id"]),
	};
};

export const normalizeAdminBillingSubscription = (
	item: unknown,
	payments: AdminBillingPayment[] = [],
): WorkspaceSubscription => {
	const source = isRecord(item) ? item : {};
	const plan = getRecord(source, "plan");
	const user = getRecord(source, "user") ?? getRecord(source, "owner");

	const id = getString(source, ["id"]);
	const userId =
		getString(source, ["userId"]) || getString(user ?? {}, ["userId", "id"]);
	const planCode = getString(source, ["planCode"]) || getString(plan ?? {}, ["code", "slug", "id"]);
	const planName = getString(source, ["planName"]) || getString(plan ?? {}, ["name"], planCode);
	const paymentHistory = [
		...getArray<unknown>(source, ["paymentHistory", "payments"]).map(
			normalizeAdminBillingPayment,
		),
		...payments.filter((payment) => payment.subscriptionId === id),
	];

	return {
		rowId:
			getString(source, ["rowId"]) ||
			[id, userId, planCode].filter(Boolean).join(":"),
		id,
		userId,
		userName:
			getString(source, ["userName"]) ||
			getString(user ?? {}, ["displayName", "fullName", "username", "email"], "-"),
		userEmail:
			getString(source, ["userEmail"]) ||
			getString(user ?? {}, ["email"], "-"),
		planCode: normalizeCode(planCode || planName || "PLAN"),
		planName,
		status: normalizeSubscriptionStatus(source),
		billingCycle: normalizeBillingCycle(plan ?? source),
		startedAt: getDateString(source, ["startedAt", "currentPeriodStart", "createdAt"]),
		renewAt: getDateString(source, ["renewAt", "currentPeriodEnd", "updatedAt"]),
		trialEndsAt: getNullableString(source, ["trialEndsAt", "trialEnd"]),
		amount:
			getNumber(source, ["amount"]) ||
			getNumber(plan ?? {}, ["priceAmount", "price", "amount"]),
		paymentMethod: getString(source, ["paymentMethod", "provider"], "Unknown"),
		couponCode: getNullableString(source, ["couponCode"]),
		paymentHistory,
	};
};
