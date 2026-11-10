"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Check,
	HelpCircle,
	Minus,
} from "lucide-react";
import { useBillingPlans } from "@/entities/billing/model/billing.queries";
import type {
	BillingInterval,
	BillingPlan,
} from "@/entities/billing/model/billing.types";
import { useUser } from "@/features/auth";
import { formatMegabytes } from "@/features/workspace-billing";
import { Button } from "@/shared/ui/button";
import { CtaSection } from "@/widgets/landing/ui/cta-section";
import {
	MARKETING_PRICING_PLANS,
	PRICING_FAQS,
} from "@/widgets/landing/data/marketing-data";

const PLAN_FEATURE_ROWS = [
	{ code: "MAX_MEMBERS", label: "Members" },
	{ code: "MAX_TEAMSPACES", label: "Teamspaces" },
	{ code: "MAX_STORAGE_MB", label: "File storage" },
	{ code: "PUBLIC_PAGE", label: "Publish pages to the web" },
] as const;

function getFeatureValue(plan: BillingPlan, code: string) {
	return plan.features.find((feature) => feature.code === code)?.value;
}

function describeFeature(code: string, value: number | boolean): string {
	if (typeof value === "boolean") return "Publish pages to the web";
	if (code === "MAX_MEMBERS") return `Up to ${value.toLocaleString("en-US")} members`;
	if (code === "MAX_TEAMSPACES") return value === 1 ? "1 teamspace" : `${value.toLocaleString("en-US")} teamspaces`;
	return `${formatMegabytes(value)} file storage`;
}

function formatLimit(code: string, value: number): string {
	return code === "MAX_STORAGE_MB" ? formatMegabytes(value) : value.toLocaleString("en-US");
}

function getMonthlyAmount(plan: BillingPlan): number {
	return plan.prices.find((price) => price.billingInterval === "MONTHLY")?.amount ?? 0;
}

function formatPlanPrice(plan: BillingPlan, interval: BillingInterval) {
	const price = plan.prices.find((item) => item.billingInterval === interval);
	const amount = new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: price?.currency ?? "VND",
		maximumFractionDigits: 0,
	}).format(price?.amount ?? 0);
	if (!price) return { amount, period: "forever" };
	return { amount, period: interval === "MONTHLY" ? "/ month" : "/ year" };
}

export function PricingPageContent() {
	const { user } = useUser();
	const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
	const { data: billingPlansResponse } = useBillingPlans();

	const plans = billingPlansResponse?.items.length
		? billingPlansResponse.items
		: MARKETING_PRICING_PLANS;
	const popularPlanId = plans
		.filter((plan) => plan.prices.length > 0)
		.sort((a, b) => getMonthlyAmount(a) - getMonthlyAmount(b))[0]?.id;

	return (
		<div className='relative overflow-hidden py-12 sm:py-20 space-y-24 sm:space-y-32'>
			{/* Subtle architectural grid backdrop in hero */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:32px_32px] text-foreground opacity-[0.035] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]'
			/>

			{/* Hero */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6'>
				<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs'>
					<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
					<span>Transparent Pricing</span>
				</div>

				<h1 className='text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08]'>
					Choose the plan that{" "}
					<span className='text-muted-foreground font-semibold'>
						fits your team.
					</span>
				</h1>

				<p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
					Start free forever and upgrade whenever your team needs structured databases, advanced teamspaces, and unlimited AI intelligence.
				</p>

				{/* Billing interval switcher */}
				<div className='pt-3 flex items-center justify-center gap-3'>
					<div className='flex items-center p-1 rounded-xl border border-border/80 bg-muted/40 shadow-2xs'>
						<button
							type='button'
							onClick={() => setBillingInterval("MONTHLY")}
							className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
								billingInterval === "MONTHLY"
									? "bg-card text-foreground shadow-2xs border border-border/70"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Monthly Billing
						</button>
						<button
							type='button'
							onClick={() => setBillingInterval("YEARLY")}
							className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
								billingInterval === "YEARLY"
									? "bg-card text-foreground shadow-2xs border border-border/70"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<span>Yearly Billing</span>
						</button>
					</div>
				</div>
			</section>

			{/* 3 Pricing Cards (Double-Bezel Framing) */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'>
					{plans.map((plan) => {
						const isPro = plan.id === popularPlanId;
						const { amount, period } = formatPlanPrice(plan, billingInterval);

						const ctaHref = user ? "/dashboard?upgrade=1" : "/sign-up";
						const ctaLabel = user
							? "Go to Billing"
							: plan.prices.length > 0
								? `Get started with ${plan.name}`
								: "Get started free";

						return (
							<div
								key={plan.id}
								className={`relative flex flex-col rounded-2xl p-1.5 transition-colors ${
									isPro
										? "border border-[#5e6ad2]/40 bg-[#eeeffc]/35 dark:bg-indigo-500/15"
										: "border border-border/80 bg-muted/30 hover:border-foreground/20"
								}`}
							>
								<div className='relative flex flex-1 flex-col rounded-xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xs'>
									<div className='space-y-4'>
										<div className='flex items-center justify-between gap-2'>
											<h2 className='text-xl font-bold tracking-tight text-foreground'>
												{plan.name}
											</h2>
											{isPro && (
												<span className='inline-flex items-center gap-1.5 rounded-full bg-[#5e6ad2] px-2.5 py-0.5 text-[10px] font-semibold text-white'>
													<span className='h-1.5 w-1.5 rounded-full bg-white' />
													Most popular
												</span>
											)}
										</div>

										<p className='text-xs text-muted-foreground leading-relaxed min-h-[36px]'>
											{plan.description}
										</p>

										<div className='pt-2 flex items-baseline gap-1'>
											<span className='text-4xl font-bold tracking-tight text-foreground font-mono'>
												{amount}
											</span>
											<span className='text-xs text-muted-foreground'>
												{period}
											</span>
										</div>
									</div>

									{/* CTA button */}
									<div className='my-6'>
										<Link href={ctaHref} className='block w-full'>
											<Button
												className={`w-full h-10 rounded-lg font-medium text-sm transition-colors ${
													isPro
														? "bg-[#5e6ad2] text-white hover:bg-[#4e5ac0] border-none"
														: "border border-border bg-background hover:bg-muted text-foreground"
												}`}
											>
												{ctaLabel}
											</Button>
										</Link>
									</div>

									{/* Feature list */}
									<div className='flex-1 border-t border-border/60 pt-6 space-y-3 text-xs'>
										<div className='font-semibold text-muted-foreground text-[11px] uppercase tracking-wider'>
											What&apos;s included:
										</div>
										{PLAN_FEATURE_ROWS.map(({ code }) => {
											const value = getFeatureValue(plan, code);
											if (value === undefined) return null;
											const included = value !== false;
											return (
												<div
													key={code}
													className={`flex items-start gap-2.5 ${
														included
															? "text-foreground font-medium"
															: "text-muted-foreground/60 line-through"
													}`}
												>
													{included ? (
														<div className='h-4 w-4 rounded border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
															<Check className='h-2.5 w-2.5' />
														</div>
													) : (
														<div className='h-4 w-4 rounded border border-border/60 bg-muted/30 text-muted-foreground flex items-center justify-center shrink-0 mt-0.5'>
															<Minus className='h-2.5 w-2.5' />
														</div>
													)}
													<span>{describeFeature(code, value)}</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Feature Comparison Table (Double-Bezel Frame) */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
					<div className='rounded-xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xs overflow-hidden'>
						<div className='mb-6'>
							<h3 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
								Compare Plan Features
							</h3>
							<p className='text-xs text-muted-foreground mt-1'>
								Detailed breakdown of resource quotas and feature entitlements.
							</p>
						</div>

						<div className='overflow-x-auto'>
							<table className='w-full text-xs text-left border-collapse'>
								<thead>
									<tr className='border-b border-border/60 text-muted-foreground font-semibold'>
										<th className='py-3 px-3 w-2/5'>Feature</th>
										{plans.map((plan) => (
											<th
												key={plan.id}
												className={`py-3 px-3 ${plan.id === popularPlanId ? "text-[#5e6ad2] dark:text-indigo-400" : ""}`}
											>
												{plan.name}
											</th>
										))}
									</tr>
								</thead>
								<tbody className='divide-y divide-border/40 text-foreground'>
									{PLAN_FEATURE_ROWS.map(({ code, label }) => (
										<tr key={code}>
											<td className='py-3 px-3 font-medium'>{label}</td>
											{plans.map((plan) => {
												const value = getFeatureValue(plan, code);
												return (
													<td key={plan.id} className='py-3 px-3'>
														{typeof value === "number" ? (
															formatLimit(code, value)
														) : value ? (
															<Check aria-label='Included' className='h-3.5 w-3.5 text-[#5e6ad2]' />
														) : (
															<Minus aria-label='Not included' className='h-3 w-3 text-muted-foreground' />
														)}
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing FAQ Section */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='text-center max-w-xl mx-auto mb-12 space-y-2.5'>
					<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
						<span>Billing FAQ</span>
					</div>
					<h3 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
						Frequently Asked Questions
					</h3>
					<p className='text-sm text-muted-foreground'>
						Everything you need to know about our plans and billing.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
					{PRICING_FAQS.map((faq) => (
						<div
							key={faq.question}
							className='rounded-2xl border border-border/80 bg-muted/30 p-1.5'
						>
							<div className='h-full rounded-xl border border-border/70 bg-card p-5 space-y-2 shadow-2xs'>
								<div className='flex items-start gap-2.5'>
									<HelpCircle className='h-4 w-4 text-[#5e6ad2] shrink-0 mt-0.5' />
									<h4 className='text-sm font-semibold text-foreground'>{faq.question}</h4>
								</div>
								<p className='text-xs text-muted-foreground leading-relaxed pl-6'>
									{faq.answer}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Final CTA */}
			<CtaSection />
		</div>
	);
}
