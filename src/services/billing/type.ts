export interface PlanLimits {
	workspaces: number;
	upgradedWorkspaces: number;
	members: number;
	projects: number;
	tasks: number;
	pages: number;
	pageTemplates: number;
	storageMb: number;
	attachments: number;
	sprints: number;
}

export enum PlanName {
	FREE = "FREE",
	PRO = "PRO",
}

export enum BillingProvider {
	MANUAL = "MANUAL",
	MOMO = "MOMO",
	VNPAY = "VNPAY",
}

export interface Plan {
	name: PlanName;
	slug: string;
	limits: PlanLimits;
}

export interface UpgradedWorkspace {
	used: number;
	limit: number;
}

export interface UserPlanInfo {
	plan: Plan;
	subscription: null;
	upgradedWorkspace: UpgradedWorkspace;
}

export interface CreatePayment {
	paymentId: string;
	orderCode: string;
	provider: BillingProvider;
	amount: number;
	currency: string;
	status: string;
	paymentUrl?: string;
}

export interface CreatePaymentPayload {
	planId: string;
	provider: BillingProvider;
	targetWorkspaceId?: string;
}

export interface PaymentReturnResult {
	completed?: boolean;
	paymentId?: string;
	orderCode?: string;
	provider?: string;
	amount?: number;
	currency?: string;
	status?: string;
	message?: string;
}

export interface BillingPlanReponse {
	id: string;
	name: BillingPlanName;
	slug: string;
	description: string;
	priceAmount: number;
	currency: Currency;
	billingInterval: BillingInterval;
	features: BillingPlanFeatures;
	limits: BillingPlanLimits;
	isActive: boolean;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export type BillingPlanName = "FREE" | "PRO";

export type Currency = "VND";

export type BillingInterval = "MONTH" | "YEAR";

export interface BillingPlanFeatures {
	kanban: boolean;
	sprint: boolean;
	storage: boolean;
	pageTemplates: boolean;
	upgradedWorkspaces?: boolean;
}

export interface BillingPlanLimits {
	pages: number;
	tasks: number;
	members: number;
	sprints: number;
	projects: number;
	storageMb: number;
	workspaces: number;
	attachments: number;
	pageTemplates: number;
	upgradedWorkspaces: number;
}
