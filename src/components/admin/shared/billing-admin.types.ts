export type BillingSection = "PLANS" | "SUBSCRIPTIONS" | "COUPONS";

export type PlanStatus = "ACTIVE" | "DISABLED" | "DRAFT";

export type BillingCycle = "MONTHLY" | "YEARLY";

export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELED";

export type CouponType = "PERCENT" | "FIXED" | "TRIAL_DAYS";

export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export type PaymentStatus = "PAID" | "FAILED" | "REFUNDED" | "PENDING";

export type BillingPlan = {
	id: string;
	name: string;
	code: string;
	description: string;
	status: PlanStatus;
	monthlyPrice: number;
	yearlyPrice: number;
	workspaceLimit: number;
	membersLimit: number;
	projectsLimit: number;
	storageLimitGb: number;
	features: string[];
	trialDays: number;
	activeSubscriptions: number;
	updatedAt: string;
};

export type BillingPayment = {
	id: string;
	invoiceNo: string;
	amount: number;
	status: PaymentStatus;
	paidAt: string;
};

export type WorkspaceSubscription = {
	id: string;
	workspaceId: string;
	workspaceName: string;
	ownerName: string;
	ownerEmail: string;
	planCode: string;
	planName: string;
	status: SubscriptionStatus;
	billingCycle: BillingCycle;
	startedAt: string;
	renewAt: string;
	trialEndsAt?: string | null;
	amount: number;
	paymentMethod: string;
	couponCode?: string | null;
	paymentHistory: BillingPayment[];
};

export type BillingCoupon = {
	id: string;
	code: string;
	type: CouponType;
	value: number;
	status: CouponStatus;
	usageCount: number;
	maxUsage: number;
	startAt: string;
	endAt: string;
	description: string;
	appliesTo: string[];
};
