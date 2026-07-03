"use client";

import { useMemo, useState } from "react";

import { BillingInsightCharts } from "@/components/admin/charts/billing-insight-charts";
import { BillingCouponDetailPanel } from "@/components/admin/detail/billing-coupon-detail-panel";
import { BillingPlanDetailPanel } from "@/components/admin/detail/billing-plan-detail-panel";
import { BillingSubscriptionDetailPanel } from "@/components/admin/detail/billing-subscription-detail-panel";

import { BillingFilterBar } from "@/components/admin/filters/billing-filter-bar";
import { BillingAdminHeader } from "@/components/admin/header/billing-admin-header";
import { BillingOverviewCards } from "@/components/admin/overview/billing-overview-cards";

import { adminCoupons } from "@/components/admin/shared/billing-admin.mock-data";

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
import { useAdminBilling } from "@/features/admin/modules/billing/hooks/useAdminBilling";
import { toAdminBillingPlanPayload } from "@/services/admin/billing/billing-admin.service";
import { toast } from "sonner";

function addDays(date: string, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next.toISOString();
}

export default function AdminPlansBillingPage() {
	const {
		plans: plansQuery,
		subscriptions: subscriptionsQuery,
		createPlan,
		updatePlan,
		updatePlanStatus,
		cancelSubscription,
		resumeSubscription,
	} = useAdminBilling();
	const [section, setSection] = useState<BillingSection>("SUBSCRIPTIONS");

	const [subscriptionOverrides, setSubscriptionOverrides] = useState<
		WorkspaceSubscription[] | null
	>(null);
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

	const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
	const subscriptions = useMemo(
		() => subscriptionOverrides ?? subscriptionsQuery.data ?? [],
		[subscriptionOverrides, subscriptionsQuery.data],
	);

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
				subscription.userName.toLowerCase().includes(keyword) ||
				subscription.userEmail.toLowerCase().includes(keyword) ||
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
			slug: "",
			description: "",
			status: "DRAFT",
			billingInterval: "MONTH",
			currency: "VND",
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

	const handleSavePlan = async (plan: BillingPlan) => {
		try {
			const payload = toAdminBillingPlanPayload(plan);
			const isNewPlan = plan.id.startsWith("plan_");

			if (isNewPlan) {
				await createPlan.mutateAsync(payload);
				toast.success("Đã tạo gói dịch vụ.");
			} else {
				await updatePlan.mutateAsync({
					planId: plan.id,
					payload,
				});
				toast.success("Đã cập nhật gói dịch vụ.");
			}

			setSelectedPlan(null);
		} catch (error) {
			console.error("save admin billing plan failed", error);
			toast.error("Không thể lưu gói dịch vụ.");
		}
	};

	const handleTogglePlanStatus = async (planId: string) => {
		const plan = plans.find((item) => item.id === planId);
		if (!plan) return;

		try {
			await updatePlanStatus.mutateAsync({
				planId,
				isActive: plan.status !== "ACTIVE",
			});
			toast.success(
				plan.status === "ACTIVE"
					? "Đã tắt gói dịch vụ."
					: "Đã bật gói dịch vụ.",
			);
		} catch (error) {
			console.error("toggle admin billing plan status failed", error);
			toast.error("Không thể cập nhật trạng thái gói.");
		}
	};

	const handleSaveSubscription = (subscription: WorkspaceSubscription) => {
		setSubscriptionOverrides((prev) =>
			(prev ?? subscriptions).map((item) =>
				item.id === subscription.id ? subscription : item,
			),
		);
		setSelectedSubscription(null);
	};

	const handleManualRenew = (subscriptionId: string) => {
		setSubscriptionOverrides((prev) =>
			(prev ?? subscriptions).map((item) =>
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
		setSubscriptionOverrides((prev) =>
			(prev ?? subscriptions).map((item) =>
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

	const handleToggleSubscriptionStatus = async (subscriptionId: string) => {
		const subscription = subscriptions.find(
			(item) => item.id === subscriptionId,
		);
		if (!subscription) return;

		try {
			if (subscription.status === "CANCELED") {
				await resumeSubscription.mutateAsync({
					subscriptionId,
					note: "Resumed from admin billing subscriptions",
				});
				setSubscriptionOverrides(null);
				toast.success("Đã kích hoạt lại gói đăng ký.");
				return;
			}

			await cancelSubscription.mutateAsync({
				subscriptionId,
				immediate: true,
				note: "Canceled from admin billing subscriptions",
			});
			setSubscriptionOverrides(null);
			toast.success("Đã hủy gói đăng ký.");
		} catch (error) {
			console.error("cancel admin billing subscription failed", error);
			toast.error("Không thể hủy gói đăng ký.");
		}
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
		<div className='space-y-5 p-4 sm:p-6'>
			<BillingAdminHeader
				onCreatePlan={handleCreatePlan}
				onCreateCoupon={handleCreateCoupon}
			/>

			<BillingOverviewCards
				plans={plans}
				subscriptions={subscriptions}
				coupons={coupons}
			/>

			<BillingInsightCharts subscriptions={subscriptions} />

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
					isUpdatingSubscription={
						cancelSubscription.isPending ||
						resumeSubscription.isPending
					}
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
				isSaving={createPlan.isPending || updatePlan.isPending}
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
