"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useBillingPlans,
	useCreateBillingPayment,
} from "@/features/billing/hooks/usePlan";
import { cn } from "@/lib/utils";
import {
	BillingProvider,
	type BillingInterval,
	PlanName,
} from "@/services/billing/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import type { LucideIcon } from "lucide-react";
import {
	ArrowLeft,
	Check,
	CircleDollarSign,
	Landmark,
	Loader2,
	ShieldCheck,
	Smartphone,
	Sparkles,
	CreditCard,
	WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { toast } from "sonner";

const PLAN_FEATURES = [
	"Unlimited upgraded workspaces",
	"More members, projects, tasks, and pages",
	"Priority storage for attachments",
	"Advanced sprint and template limits",
];

type PaymentMethod = {
	provider: BillingProvider;
	title: string;
	description: string;
	icon: LucideIcon;
};

const PAYMENT_METHODS: PaymentMethod[] = [
	{
		provider: BillingProvider.MANUAL,
		title: "Manual",
		description: "Tao yeu cau thanh toan thu cong de admin xac nhan.",
		icon: Landmark,
	},
	{
		provider: BillingProvider.MOMO,
		title: "MoMo",
		description: "Thanh toan bang vi MoMo neu backend tra ve payment URL.",
		icon: Smartphone,
	},
	{
		provider: BillingProvider.VNPAY,
		title: "VNPay",
		description: "Thanh toan qua cong VNPAY, QR, ATM hoac banking.",
		icon: WalletCards,
	},
	{
		provider: BillingProvider.STRIPE,
		title: "Visa / Mastercard",
		description: "Thanh toan the quoc te an toan qua Stripe Checkout.",
		icon: CreditCard,
	},
];

const formatCurrency = (amount: number, currency = "VND") =>
	new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);

function UpgradeBillingContent() {
	const [billingInterval, setBillingInterval] =
		useState<BillingInterval>("MONTH");
	const [selectedProvider, setSelectedProvider] = useState<BillingProvider>(
		BillingProvider.VNPAY,
	);
	const { planList } = useBillingPlans();
	const { createBillingPayment } = useCreateBillingPayment();
	const { currentWorkspaceId } = useProjectSelectionStore();
	const searchParams = useSearchParams();
	const targetWorkspaceId =
		searchParams.get("workspaceId") || currentWorkspaceId || undefined;

	const plans = useMemo(() => planList.data?.data ?? [], [planList.data]);
	const proPlans = useMemo(
		() =>
			plans
				.filter((plan) => plan.name === PlanName.PRO && plan.isActive)
				.sort((first, second) => first.sortOrder - second.sortOrder),
		[plans],
	);
	const selectedPlan =
		proPlans.find((plan) => plan.billingInterval === billingInterval) ??
		proPlans[0];
	const monthlyPlan = proPlans.find(
		(plan) => plan.billingInterval === "MONTH",
	);
	const yearlyPlan = proPlans.find((plan) => plan.billingInterval === "YEAR");
	const amount = selectedPlan?.priceAmount ?? 0;
	const selectedPaymentMethod =
		PAYMENT_METHODS.find(
			(method) => method.provider === selectedProvider,
		) ?? PAYMENT_METHODS[0];
	const isPaymentDisabled =
		planList.isLoading || createBillingPayment.isPending || !selectedPlan;

	const handlePayment = async () => {
		if (!selectedPlan) {
			toast.error("Khong tim thay goi PRO de tao thanh toan.");
			return;
		}

		if (!targetWorkspaceId) {
			toast.error("Vui long chon workspace truoc khi tao thanh toan.");
			return;
		}

		try {
			const response = await createBillingPayment.mutateAsync({
				planId: selectedPlan.id,
				provider: selectedProvider,
				targetWorkspaceId,
			});
			const paymentUrl = response.data.paymentUrl;

			if (!paymentUrl) {
				toast.error(
					`${selectedPaymentMethod.title} chua co payment URL tu server.`,
				);
				return;
			}

			window.location.assign(paymentUrl);
		} catch (error) {
			console.error("create billing payment failed", error);
			toast.error("Tao thanh toan that bai. Vui long thu lai.");
		}
	};

	return (
		<main className='min-h-0 flex-1 overflow-y-auto pb-8'>
			<div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
				<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
					<div className='space-y-3'>
						<Button
							asChild
							variant='ghost'
							size='sm'
							className='-ml-2 w-fit'
						>
							<Link href='/dashboard'>
								<ArrowLeft />
								Back to dashboard
							</Link>
						</Button>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Sparkles className='size-5 text-primary' />
								<h1 className='text-2xl font-semibold tracking-normal md:text-3xl'>
									Upgrade to Pro
								</h1>
							</div>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
								Mo khoa gioi han cao hon cho workspace, project,
								task, page va attachment cua team.
							</p>
						</div>
					</div>
					<Badge variant='secondary' className='rounded-md px-3 py-1'>
						Current plan: Free
					</Badge>
				</div>

				<div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
					<section className='space-y-6'>
						<Card className='rounded-lg'>
							<CardHeader>
								<CardTitle>Choose billing cycle</CardTitle>
								<CardDescription>
									He thong se lay plan PRO tu API va dung plan
									id de tao payment.
								</CardDescription>
							</CardHeader>
							<CardContent>
								{planList.isLoading ? (
									<div className='grid gap-3 sm:grid-cols-2'>
										<Skeleton className='h-20 rounded-lg' />
										<Skeleton className='h-20 rounded-lg' />
									</div>
								) : (
									<div className='grid gap-3 sm:grid-cols-2'>
										<Button
											type='button'
											variant={
												billingInterval === "MONTH"
													? "default"
													: "outline"
											}
											className='h-auto justify-between rounded-lg px-4 py-4'
											disabled={!monthlyPlan}
											onClick={() =>
												setBillingInterval("MONTH")
											}
										>
											<span className='flex flex-col items-start gap-1 text-left'>
												<span>Monthly</span>
												<span className='text-xs font-normal opacity-75'>
													{monthlyPlan
														? `${formatCurrency(
																monthlyPlan.priceAmount,
																monthlyPlan.currency,
															)}/month`
														: "Unavailable"}
												</span>
											</span>
											{billingInterval === "MONTH" ? (
												<Check />
											) : null}
										</Button>
										<Button
											type='button'
											variant={
												billingInterval === "YEAR"
													? "default"
													: "outline"
											}
											className='h-auto justify-between rounded-lg px-4 py-4'
											disabled={!yearlyPlan}
											onClick={() =>
												setBillingInterval("YEAR")
											}
										>
											<span className='flex flex-col items-start gap-1 text-left'>
												<span>Yearly</span>
												<span className='text-xs font-normal opacity-75'>
													{yearlyPlan
														? `${formatCurrency(
																yearlyPlan.priceAmount,
																yearlyPlan.currency,
															)}/year`
														: "Unavailable"}
												</span>
											</span>
											{billingInterval === "YEAR" ? (
												<Check />
											) : null}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>

						<Card className='rounded-lg'>
							<CardHeader>
								<CardTitle>Choose payment method</CardTitle>
								<CardDescription>
									Chon phuong thuc thanh toan. Visa va
									Mastercard se duoc xu ly an toan boi Stripe
									Checkout.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
									{PAYMENT_METHODS.map((method) => {
										const Icon = method.icon;
										const isSelected =
											selectedProvider ===
											method.provider;

										return (
											<button
												key={method.provider}
												type='button'
												aria-pressed={isSelected}
												className={cn(
													"flex min-h-36 flex-col items-start gap-4 rounded-lg border bg-card p-4 text-left text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
													isSelected &&
														"border-primary bg-accent",
												)}
												onClick={() =>
													setSelectedProvider(
														method.provider,
													)
												}
											>
												<span className='flex w-full items-center justify-between gap-3'>
													<span className='flex size-10 items-center justify-center rounded-md border bg-background'>
														<Icon className='size-5' />
													</span>
													{isSelected ? (
														<span className='flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground'>
															<Check className='size-3.5' />
														</span>
													) : null}
												</span>
												<span className='space-y-1'>
													<span className='block font-medium'>
														{method.title}
													</span>
													<span className='block leading-5 text-muted-foreground'>
														{method.description}
													</span>
												</span>
											</button>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</section>

					<aside className='lg:sticky lg:top-4 lg:self-start'>
						<Card className='rounded-lg'>
							<CardHeader>
								<div className='flex items-center justify-between gap-3'>
									<div>
										<CardTitle>Order summary</CardTitle>
										<CardDescription>
											Plan {PlanName.PRO}
										</CardDescription>
									</div>
									<CircleDollarSign className='size-5 text-muted-foreground' />
								</div>
							</CardHeader>
							<CardContent className='space-y-5'>
								<div className='space-y-3'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>
											Billing cycle
										</span>
										<span className='font-medium'>
											{billingInterval === "MONTH"
												? "Monthly"
												: "Yearly"}
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>
											Payment
										</span>
										<span className='font-medium'>
											{selectedPaymentMethod.title}
										</span>
									</div>
								</div>
								<Separator />
								<div className='flex items-end justify-between gap-4'>
									<span className='text-sm text-muted-foreground'>
										Total
									</span>
									<span className='text-2xl font-semibold'>
										{selectedPlan
											? formatCurrency(
													amount,
													selectedPlan.currency,
												)
											: "-"}
									</span>
								</div>
								<div className='space-y-3 rounded-lg bg-muted p-4'>
									<div className='flex items-center gap-2 text-sm font-medium'>
										<ShieldCheck className='size-4' />
										Pro includes
									</div>
									<ul className='space-y-2 text-sm text-muted-foreground'>
										{PLAN_FEATURES.map((feature) => (
											<li
												key={feature}
												className='flex gap-2 leading-5'
											>
												<Check className='mt-0.5 size-4 shrink-0 text-foreground' />
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									type='button'
									className='w-full'
									size='lg'
									disabled={isPaymentDisabled}
									onClick={handlePayment}
								>
									{createBillingPayment.isPending ? (
										<>
											<Loader2 className='animate-spin' />
											Creating payment
										</>
									) : (
										`Continue with ${selectedPaymentMethod.title}`
									)}
								</Button>
							</CardFooter>
						</Card>
					</aside>
				</div>
			</div>
		</main>
	);
}

export default function UpgradeBillingPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
			<UpgradeBillingContent />
		</Suspense>
	);
}
