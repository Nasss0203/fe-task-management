"use client";

import { useMemo, useState } from "react";

import { BillingCouponDetailPanel } from "@/components/admin/detail/billing-coupon-detail-panel";
import { BillingPlanDetailPanel } from "@/components/admin/detail/billing-plan-detail-panel";
import { BillingSubscriptionDetailPanel } from "@/components/admin/detail/billing-subscription-detail-panel";

import { BillingFilterBar } from "@/components/admin/filters/billing-filter-bar";
import { BillingAdminHeader } from "@/components/admin/header/billing-admin-header";
import { BillingOverviewCards } from "@/components/admin/overview/billing-overview-cards";

import {
	adminBillingPlans,
	adminCoupons,
	adminSubscriptions,
} from "@/components/admin/shared/billing-admin.mock-data";

import type {
	BillingCoupon,
	BillingPlan,
	BillingSection,
	WorkspaceSubscription,
} from "@/components/admin/shared/billing-admin.types";

import { matchesBillingDateFilter } from "@/components/admin/shared/billing-admin.utils";

import { BillingCouponManagementTable } from "@/components/admin/table/billing-coupon-management-table";
import { BillingPlanManagementTable } from "@/components/admin/table/billing-plan-management-table";
import { BillingSubscriptionManagementTable } from "@/components/admin/table/billing-subscription-management-table";

function addDays(date: string, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next.toISOString();
}

export default function AdminPlansBillingPage() {
	const [section, setSection] = useState<BillingSection>("SUBSCRIPTIONS");

	const [plans, setPlans] = useState<BillingPlan[]>(adminBillingPlans);
	const [subscriptions, setSubscriptions] =
		useState<WorkspaceSubscription[]>(adminSubscriptions);
	const [coupons, setCoupons] = useState<BillingCoupon[]>(adminCoupons);

	const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
	const [selectedSubscription, setSelectedSubscription] =
		useState<WorkspaceSubscription | null>(null);
	const [selectedCoupon, setSelectedCoupon] = useState<BillingCoupon | null>(
		null,
	);

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [kind, setKind] = useState("all");
	const [createdAt, setCreatedAt] = useState("all");

	const filteredPlans = useMemo(() => {
		return plans.filter((plan) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				plan.name.toLowerCase().includes(keyword) ||
				plan.code.toLowerCase().includes(keyword) ||
				plan.description.toLowerCase().includes(keyword);

			const matchesStatus = status === "all" || plan.status === status;

			const matchesKind =
				kind === "all" ||
				(kind === "with_trial" && plan.trialDays > 0) ||
				(kind === "no_trial" && plan.trialDays === 0) ||
				(kind === "enterprise" && plan.storageLimitGb >= 100);

			const matchesDate = matchesBillingDateFilter(
				plan.updatedAt,
				createdAt,
			);

			return matchesSearch && matchesStatus && matchesKind && matchesDate;
		});
	}, [plans, search, status, kind, createdAt]);

	const filteredSubscriptions = useMemo(() => {
		return subscriptions.filter((subscription) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				subscription.workspaceName.toLowerCase().includes(keyword) ||
				subscription.ownerName.toLowerCase().includes(keyword) ||
				subscription.ownerEmail.toLowerCase().includes(keyword) ||
				subscription.planName.toLowerCase().includes(keyword);

			const matchesStatus =
				status === "all" || subscription.status === status;

			const matchesKind =
				kind === "all" || subscription.billingCycle === kind;

			const matchesDate = matchesBillingDateFilter(
				subscription.startedAt,
				createdAt,
			);

			return matchesSearch && matchesStatus && matchesKind && matchesDate;
		});
	}, [subscriptions, search, status, kind, createdAt]);

	const filteredCoupons = useMemo(() => {
		return coupons.filter((coupon) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				coupon.code.toLowerCase().includes(keyword) ||
				coupon.description.toLowerCase().includes(keyword);

			const matchesStatus = status === "all" || coupon.status === status;
			const matchesKind = kind === "all" || coupon.type === kind;
			const matchesDate = matchesBillingDateFilter(
				coupon.startAt,
				createdAt,
			);

			return matchesSearch && matchesStatus && matchesKind && matchesDate;
		});
	}, [coupons, search, status, kind, createdAt]);

	const handleResetFilters = () => {
		setSearch("");
		setStatus("all");
		setKind("all");
		setCreatedAt("all");
	};

	const handleCreatePlan = () => {
		setSelectedPlan({
			id: `plan_${Date.now()}`,
			name: "",
			code: "",
			description: "",
			status: "DRAFT",
			monthlyPrice: 0,
			yearlyPrice: 0,
			workspaceLimit: 1,
			membersLimit: 5,
			projectsLimit: 5,
			storageLimitGb: 5,
			features: [],
			trialDays: 0,
			activeSubscriptions: 0,
			updatedAt: new Date().toISOString(),
		});
	};

	const handleCreateCoupon = () => {
		setSelectedCoupon({
			id: `coupon_${Date.now()}`,
			code: "",
			type: "PERCENT",
			value: 10,
			status: "ACTIVE",
			usageCount: 0,
			maxUsage: 100,
			startAt: new Date().toISOString(),
			endAt: new Date().toISOString(),
			description: "",
			appliesTo: ["PRO"],
		});
	};

	const handleSavePlan = (plan: BillingPlan) => {
		setPlans((prev) => {
			const exists = prev.some((item) => item.id === plan.id);
			if (!exists) return [plan, ...prev];
			return prev.map((item) => (item.id === plan.id ? plan : item));
		});
		setSelectedPlan(null);
	};

	const handleTogglePlanStatus = (planId: string) => {
		setPlans((prev) =>
			prev.map((plan) =>
				plan.id === planId
					? {
							...plan,
							status:
								plan.status === "ACTIVE"
									? "DISABLED"
									: "ACTIVE",
							updatedAt: new Date().toISOString(),
						}
					: plan,
			),
		);
	};

	const handleSaveSubscription = (subscription: WorkspaceSubscription) => {
		setSubscriptions((prev) =>
			prev.map((item) =>
				item.id === subscription.id ? subscription : item,
			),
		);
		setSelectedSubscription(null);
	};

	const handleManualRenew = (subscriptionId: string) => {
		setSubscriptions((prev) =>
			prev.map((item) =>
				item.id === subscriptionId
					? {
							...item,
							status: "ACTIVE",
							renewAt:
								item.billingCycle === "MONTHLY"
									? addDays(item.renewAt, 30)
									: addDays(item.renewAt, 365),
						}
					: item,
			),
		);
	};

	const handleGrantTrial = (subscriptionId: string) => {
		setSubscriptions((prev) =>
			prev.map((item) =>
				item.id === subscriptionId
					? {
							...item,
							status: "TRIAL",
							trialEndsAt: addDays(new Date().toISOString(), 14),
							renewAt: addDays(new Date().toISOString(), 14),
							amount: 0,
						}
					: item,
			),
		);
	};

	const handleToggleSubscriptionStatus = (subscriptionId: string) => {
		setSubscriptions((prev) =>
			prev.map((item) =>
				item.id === subscriptionId
					? {
							...item,
							status:
								item.status === "CANCELED"
									? "ACTIVE"
									: "CANCELED",
						}
					: item,
			),
		);
	};

	const handleSaveCoupon = (coupon: BillingCoupon) => {
		setCoupons((prev) => {
			const exists = prev.some((item) => item.id === coupon.id);
			if (!exists) return [coupon, ...prev];
			return prev.map((item) => (item.id === coupon.id ? coupon : item));
		});
		setSelectedCoupon(null);
	};

	const handleToggleCouponStatus = (couponId: string) => {
		setCoupons((prev) =>
			prev.map((coupon) =>
				coupon.id === couponId
					? {
							...coupon,
							status:
								coupon.status === "ACTIVE"
									? "INACTIVE"
									: "ACTIVE",
						}
					: coupon,
			),
		);
	};

	return (
		<div className='space-y-6 p-6'>
			<BillingAdminHeader
				onCreatePlan={handleCreatePlan}
				onCreateCoupon={handleCreateCoupon}
			/>

			<BillingOverviewCards
				plans={plans}
				subscriptions={subscriptions}
				coupons={coupons}
			/>

			<BillingFilterBar
				section={section}
				search={search}
				status={status}
				kind={kind}
				createdAt={createdAt}
				onSectionChange={setSection}
				onSearchChange={setSearch}
				onStatusChange={setStatus}
				onKindChange={setKind}
				onCreatedAtChange={setCreatedAt}
				onReset={handleResetFilters}
			/>

			{section === "PLANS" && (
				<BillingPlanManagementTable
					plans={filteredPlans}
					onView={setSelectedPlan}
					onToggleStatus={handleTogglePlanStatus}
				/>
			)}

			{section === "SUBSCRIPTIONS" && (
				<BillingSubscriptionManagementTable
					subscriptions={filteredSubscriptions}
					onView={setSelectedSubscription}
					onManualRenew={handleManualRenew}
					onGrantTrial={handleGrantTrial}
					onToggleStatus={handleToggleSubscriptionStatus}
				/>
			)}

			{section === "COUPONS" && (
				<BillingCouponManagementTable
					coupons={filteredCoupons}
					onView={setSelectedCoupon}
					onToggleStatus={handleToggleCouponStatus}
				/>
			)}

			<BillingPlanDetailPanel
				key={selectedPlan?.id ?? "billing-plan"}
				plan={selectedPlan}
				onClose={() => setSelectedPlan(null)}
				onSave={handleSavePlan}
			/>

			<BillingSubscriptionDetailPanel
				key={selectedSubscription?.id ?? "billing-subscription"}
				subscription={selectedSubscription}
				plans={plans}
				onClose={() => setSelectedSubscription(null)}
				onSave={handleSaveSubscription}
				onManualRenew={handleManualRenew}
				onGrantTrial={handleGrantTrial}
			/>

			<BillingCouponDetailPanel
				key={selectedCoupon?.id ?? "billing-coupon"}
				coupon={selectedCoupon}
				onClose={() => setSelectedCoupon(null)}
				onSave={handleSaveCoupon}
			/>
		</div>
	);
}
