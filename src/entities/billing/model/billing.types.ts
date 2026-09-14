export type BillingProvider = "SEPAY" | "STRIPE";

export type BillingInterval = "MONTHLY" | "YEARLY";

export type WorkspaceSubscriptionStatus =
	| "PENDING"
	| "ACTIVE"
	| "PAST_DUE"
	| "CANCELED"
	| "EXPIRED";

export interface BillingFeature {
	id: string;
	featureId: string;
	code: string;
	name: string;
	description: string;
	valueType: "NUMBER" | "BOOLEAN";
	value: number | boolean;
}

export interface BillingPrice {
	id: string;
	billingInterval: BillingInterval;
	currency: string;
	amount: number;
	provider: BillingProvider;
}

export interface BillingPlan {
	id: string;
	code: string;
	name: string;
	description: string;
	features: BillingFeature[];
	prices: BillingPrice[];
}

export interface BillingPlansResponse {
	items: BillingPlan[];
}

export interface WorkspaceSubscription {
	subscriptionId: string | null;
	workspaceId: string;
	plan: {
		id: string;
		code: string;
		name: string;
	};
	planPriceId: string | null;
	provider: BillingProvider | null;
	status: WorkspaceSubscriptionStatus;
	currentPeriodStart: string | null;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
}

export interface BillingApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}

export interface CreateBillingCheckoutInput {
	workspaceId: string;
	planPriceId: string;
}

export interface BillingCheckout {
	paymentOrderId: string;
	workspaceId: string;
	planPriceId: string;
	orderCode: string;
	amount: number;
	currency: string;
	provider: BillingProvider;
	status: string;
	expiresAt: string;
	checkoutUrl: string;
	checkoutMethod: "GET" | "POST";
	checkoutFields: Record<string, string | number>;
}
