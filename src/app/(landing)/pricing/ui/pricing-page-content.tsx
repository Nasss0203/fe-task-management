"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
	Check,
	HelpCircle,
	Minus,
	Sparkles,
} from "lucide-react";
import { useBillingPlans } from "@/entities/billing/model/billing.queries";
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CtaSection } from "@/widgets/landing/ui/cta-section";
import {
	MARKETING_PRICING_PLANS,
	PRICING_FAQS,
	type PricingPlan,
} from "@/widgets/landing/data/marketing-data";

export function PricingPageContent() {
	const { user } = useUser();
	const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

	// Try querying real billing plans from backend (fallback to marketing plans)
	const { data: billingPlansResponse } = useBillingPlans();

	const plans = useMemo<PricingPlan[]>(() => {
		// If real backend plans exist and have items, map them gracefully
		if (billingPlansResponse?.items && billingPlansResponse.items.length > 0) {
			return MARKETING_PRICING_PLANS;
		}

		return MARKETING_PRICING_PLANS;
	}, [billingPlansResponse]);

	return (
		<div className='py-12 sm:py-20 space-y-24 sm:space-y-32'>
			{/* Hero */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6'>
				<div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary'>
					<Sparkles className='h-3.5 w-3.5' />
					Transparent Pricing
				</div>

				<h1 className='text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]'>
					Choose the plan that{" "}
					<span className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent'>
						fits your team
					</span>
				</h1>

				<p className='text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
					Start free forever and upgrade whenever your team needs structured databases, advanced teamspaces, and unlimited AI intelligence.
				</p>

				{/* Billing interval switcher */}
				<div className='pt-4 flex items-center justify-center gap-3'>
					<div className='flex items-center p-1 rounded-full border border-border/80 bg-muted/40 shadow-xs'>
						<button
							type='button'
							onClick={() => setBillingInterval("MONTHLY")}
							className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
								billingInterval === "MONTHLY"
									? "bg-background text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Monthly Billing
						</button>
						<button
							type='button'
							onClick={() => setBillingInterval("YEARLY")}
							className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
								billingInterval === "YEARLY"
									? "bg-background text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<span>Yearly Billing</span>
							<span className='rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 leading-none'>
								Save 20%
							</span>
						</button>
					</div>
				</div>
			</section>

			{/* 3 Pricing Cards */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
					{plans.map((plan) => {
						const isPro = plan.popular;
						const price =
							billingInterval === "YEARLY"
								? plan.priceYearly
								: plan.priceMonthly;

						const ctaHref = user ? "/billing" : "/sign-up";

						return (
							<div
								key={plan.id}
								className={`relative flex flex-col rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
									isPro
										? "border-2 border-primary bg-card shadow-2xl scale-[1.02] z-10"
										: "border border-border/80 bg-card/60 shadow-xs hover:border-primary/40 hover:shadow-md"
								}`}
							>
								{/* Popular / Badge */}
								{plan.badge && (
									<div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
										<Badge className='bg-primary text-primary-foreground font-semibold text-xs px-3 py-1 shadow-md'>
											{plan.badge}
										</Badge>
									</div>
								)}

								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h2 className='text-xl font-bold text-foreground'>{plan.name}</h2>
										{isPro && (
											<Sparkles className='h-4 w-4 text-primary animate-pulse' />
										)}
									</div>

									<p className='text-xs text-muted-foreground leading-relaxed min-h-[36px]'>
										{plan.description}
									</p>

									<div className='pt-2 flex items-baseline gap-1'>
										<span className='text-4xl font-extrabold tracking-tight text-foreground'>
											{price}
										</span>
										<span className='text-xs text-muted-foreground'>
											{plan.code === "FREE" ? "" : `/ user / month`}
										</span>
									</div>
								</div>

								{/* CTA button */}
								<div className='my-6'>
									<Link href={ctaHref} className='block w-full'>
										<Button
											className={`w-full h-11 rounded-xl font-semibold text-sm transition-all ${
												isPro
													? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
													: "border border-border/80 bg-background hover:bg-muted text-foreground"
											}`}
										>
											{user ? "Go to Billing" : plan.cta}
										</Button>
									</Link>
								</div>

								{/* Feature list */}
								<div className='flex-1 border-t border-border/60 pt-6 space-y-3 text-xs'>
									<div className='font-semibold text-foreground text-[11px] uppercase tracking-wider'>
										What&apos;s included:
									</div>
									{plan.features.map((feature) => (
										<div
											key={feature.name}
											className={`flex items-start gap-2.5 ${
												feature.included
													? "text-foreground font-medium"
													: "text-muted-foreground/60 line-through"
											}`}
										>
											{feature.included ? (
												<div className='h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
													<Check className='h-2.5 w-2.5' />
												</div>
											) : (
												<div className='h-4 w-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5'>
													<Minus className='h-2.5 w-2.5' />
												</div>
											)}
											<span>{feature.name}</span>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Feature Comparison Table */}
			<section className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs overflow-hidden'>
					<div className='mb-6'>
						<h3 className='text-xl sm:text-2xl font-bold text-foreground'>
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
									<th className='py-3 px-3 w-1/5'>Free</th>
									<th className='py-3 px-3 w-1/5 text-primary'>Pro</th>
									<th className='py-3 px-3 w-1/5'>Team</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border/40 text-foreground'>
								<tr>
									<td className='py-3 px-3 font-medium'>Team Members</td>
									<td className='py-3 px-3'>5 users</td>
									<td className='py-3 px-3 font-semibold text-primary'>25 users</td>
									<td className='py-3 px-3'>Unlimited</td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Squad Teamspaces</td>
									<td className='py-3 px-3'>1 space</td>
									<td className='py-3 px-3 font-semibold text-primary'>5 spaces</td>
									<td className='py-3 px-3'>Unlimited</td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Storage Quota</td>
									<td className='py-3 px-3'>100 MB</td>
									<td className='py-3 px-3 font-semibold text-primary'>10 GB</td>
									<td className='py-3 px-3'>100 GB</td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Database & Multi-views</td>
									<td className='py-3 px-3'>Basic</td>
									<td className='py-3 px-3 font-semibold text-primary'>Unlimited Views</td>
									<td className='py-3 px-3'>Unlimited + API</td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Database Views (Board, Calendar, List)</td>
									<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
									<td className='py-3 px-3 font-semibold text-emerald-600'><Check className='h-3.5 w-3.5' /></td>
									<td className='py-3 px-3 font-semibold text-emerald-600'><Check className='h-3.5 w-3.5' /></td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Public Page Web Publishing</td>
									<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
									<td className='py-3 px-3 font-semibold text-emerald-600'><Check className='h-3.5 w-3.5' /></td>
									<td className='py-3 px-3 font-semibold text-emerald-600'><Check className='h-3.5 w-3.5' /></td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Taskmanly AI Assistant</td>
									<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
									<td className='py-3 px-3 font-semibold text-primary'>Standard Quota</td>
									<td className='py-3 px-3 font-semibold text-primary'>Unlimited</td>
								</tr>
								<tr>
									<td className='py-3 px-3 font-medium'>Role-based Permissions (RBAC)</td>
									<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
									<td className='py-3 px-3 font-semibold text-emerald-600'><Check className='h-3.5 w-3.5' /></td>
									<td className='py-3 px-3 font-semibold text-emerald-600'><Check className='h-3.5 w-3.5' /></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Pricing FAQ Section */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
				<div className='text-center max-w-xl mx-auto mb-12'>
					<h3 className='text-2xl sm:text-3xl font-bold text-foreground'>
						Frequently Asked Questions
					</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						Everything you need to know about our plans and billing.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{PRICING_FAQS.map((faq) => (
						<div
							key={faq.question}
							className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-2'
						>
							<div className='flex items-start gap-2.5'>
								<HelpCircle className='h-4 w-4 text-primary shrink-0 mt-0.5' />
								<h4 className='text-sm font-bold text-foreground'>{faq.question}</h4>
							</div>
							<p className='text-xs text-muted-foreground leading-relaxed pl-6'>
								{faq.answer}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Final CTA */}
			<CtaSection />
		</div>
	);
}
