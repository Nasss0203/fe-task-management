"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
	Check,
	HelpCircle,
	Minus,
} from "lucide-react";
import { useBillingPlans } from "@/entities/billing/model/billing.queries";
import { useUser } from "@/features/auth";
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
							<span className='rounded border border-[#5e6ad2]/25 bg-[#eeeffc] text-[#434cb8] dark:bg-indigo-500/15 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 leading-none'>
								Save 20%
							</span>
						</button>
					</div>
				</div>
			</section>

			{/* 3 Pricing Cards (Double-Bezel Framing) */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'>
					{plans.map((plan) => {
						const isPro = plan.popular;
						const price =
							billingInterval === "YEARLY"
								? plan.priceYearly
								: plan.priceMonthly;

						const ctaHref = user ? "/dashboard?upgrade=1" : "/sign-up";

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
									{/* Popular / Badge */}
									<div className='space-y-4'>
										<div className='flex items-center justify-between gap-2'>
											<h2 className='text-xl font-bold tracking-tight text-foreground'>
												{plan.name}
											</h2>
											{plan.badge && (
												<span className='inline-flex items-center gap-1.5 rounded-full bg-[#5e6ad2] px-2.5 py-0.5 text-[10px] font-semibold text-white'>
													<span className='h-1.5 w-1.5 rounded-full bg-white' />
													{plan.badge}
												</span>
											)}
										</div>

										<p className='text-xs text-muted-foreground leading-relaxed min-h-[36px]'>
											{plan.description}
										</p>

										<div className='pt-2 flex items-baseline gap-1'>
											<span className='text-4xl font-bold tracking-tight text-foreground font-mono'>
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
												className={`w-full h-10 rounded-lg font-medium text-sm transition-colors ${
													isPro
														? "bg-[#5e6ad2] text-white hover:bg-[#4e5ac0] border-none"
														: "border border-border bg-background hover:bg-muted text-foreground"
												}`}
											>
												{user ? "Go to Billing" : plan.cta}
											</Button>
										</Link>
									</div>

									{/* Feature list */}
									<div className='flex-1 border-t border-border/60 pt-6 space-y-3 text-xs'>
										<div className='font-semibold text-muted-foreground text-[11px] uppercase tracking-wider'>
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
													<div className='h-4 w-4 rounded border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
														<Check className='h-2.5 w-2.5' />
													</div>
												) : (
													<div className='h-4 w-4 rounded border border-border/60 bg-muted/30 text-muted-foreground flex items-center justify-center shrink-0 mt-0.5'>
														<Minus className='h-2.5 w-2.5' />
													</div>
												)}
												<span>{feature.name}</span>
											</div>
										))}
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
										<th className='py-3 px-3 w-1/5'>Free</th>
										<th className='py-3 px-3 w-1/5 text-[#5e6ad2] dark:text-indigo-400'>Pro</th>
										<th className='py-3 px-3 w-1/5'>Team</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border/40 text-foreground'>
									<tr>
										<td className='py-3 px-3 font-medium'>Team Members</td>
										<td className='py-3 px-3'>5 users</td>
										<td className='py-3 px-3 font-semibold text-foreground'>25 users</td>
										<td className='py-3 px-3'>Unlimited</td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Squad Teamspaces</td>
										<td className='py-3 px-3'>1 space</td>
										<td className='py-3 px-3 font-semibold text-foreground'>5 spaces</td>
										<td className='py-3 px-3'>Unlimited</td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Storage Quota</td>
										<td className='py-3 px-3'>100 MB</td>
										<td className='py-3 px-3 font-semibold text-foreground'>10 GB</td>
										<td className='py-3 px-3'>100 GB</td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Database & Multi-views</td>
										<td className='py-3 px-3'>Basic</td>
										<td className='py-3 px-3 font-semibold text-foreground'>Unlimited Views</td>
										<td className='py-3 px-3'>Unlimited + API</td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Database Views (Board, Calendar, List)</td>
										<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
										<td className='py-3 px-3 font-semibold text-[#5e6ad2]'><Check className='h-3.5 w-3.5' /></td>
										<td className='py-3 px-3 font-semibold text-[#5e6ad2]'><Check className='h-3.5 w-3.5' /></td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Public Page Web Publishing</td>
										<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
										<td className='py-3 px-3 font-semibold text-[#5e6ad2]'><Check className='h-3.5 w-3.5' /></td>
										<td className='py-3 px-3 font-semibold text-[#5e6ad2]'><Check className='h-3.5 w-3.5' /></td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Taskmanly AI Assistant</td>
										<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
										<td className='py-3 px-3 font-semibold text-foreground'>Standard Quota</td>
										<td className='py-3 px-3 font-semibold text-foreground'>Unlimited</td>
									</tr>
									<tr>
										<td className='py-3 px-3 font-medium'>Workspace &amp; Page Permissions</td>
										<td className='py-3 px-3 text-muted-foreground'><Minus className='h-3 w-3' /></td>
										<td className='py-3 px-3 font-semibold text-[#5e6ad2]'><Check className='h-3.5 w-3.5' /></td>
										<td className='py-3 px-3 font-semibold text-[#5e6ad2]'><Check className='h-3.5 w-3.5' /></td>
									</tr>
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
