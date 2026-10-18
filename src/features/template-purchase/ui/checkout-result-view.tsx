"use client";

import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Loader2,
	XCircle,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";

import { useCheckoutResult } from "../model/use-checkout-result";

interface CheckoutResultViewProps {
	purchaseId: string | null;
	/** Which Stripe return URL the buyer came back through. */
	outcome: "success" | "cancelled";
}

export function CheckoutResultView({
	purchaseId,
	outcome,
}: CheckoutResultViewProps) {
	const { user, isBootstrapped, isAuthenticated } = useUser();
	const result = useCheckoutResult(purchaseId, user?.id, {
		poll: outcome === "success",
	});

	if (isBootstrapped && !isAuthenticated) {
		const here =
			typeof window === "undefined"
				? "/templates"
				: window.location.pathname + window.location.search;
		return (
			<ResultCard icon={Clock} title='Sign in to see your purchase'>
				<p>Payments are linked to your account.</p>
				<Actions>
					<Button asChild>
						<Link href={`/sign-in?next=${encodeURIComponent(here)}`}>Sign in</Link>
					</Button>
				</Actions>
			</ResultCard>
		);
	}

	const libraryLink = (
		<Button asChild variant='outline'>
			<Link href='/dashboard/templates/library'>Go to my templates</Link>
		</Button>
	);

	switch (result.kind) {
		case "loading":
			return (
				<ResultCard icon={Loader2} spin title='Checking your payment…'>
					<p>This only takes a moment.</p>
				</ResultCard>
			);
		case "invalid":
			return (
				<ResultCard icon={AlertTriangle} title='Payment link not recognised'>
					<p>
						This checkout link is incomplete or not yours. Open the template
						page to check your purchase.
					</p>
					<Actions>{libraryLink}</Actions>
				</ResultCard>
			);
		case "error":
			return (
				<ResultCard icon={AlertTriangle} title="Couldn't check your payment">
					<p>Please try again in a moment.</p>
					<Actions>
						<Button onClick={result.retry}>Try again</Button>
						<BackToTemplate href={result.returnPath} />
					</Actions>
				</ResultCard>
			);
		case "timeout":
			return (
				<ResultCard icon={Clock} title='Payment is taking longer than expected'>
					<p>
						You can check again. You don&apos;t need to pay again while we
						wait for confirmation.
					</p>
					<Actions>
						<Button onClick={result.retry}>Check again</Button>
						<BackToTemplate href={result.returnPath} />
					</Actions>
				</ResultCard>
			);
	}

	const back = <BackToTemplate href={result.returnPath} />;

	switch (result.purchase.status) {
		case "PAID":
			return (
				<ResultCard icon={CheckCircle2} tone='success' title='Payment successful'>
					<p>The template is yours. You can use it in any workspace.</p>
					<Actions>
						<Button asChild>
							<Link href={result.returnPath}>Use template</Link>
						</Button>
					</Actions>
				</ResultCard>
			);
		case "PENDING":
			return outcome === "cancelled" ? (
				<ResultCard icon={XCircle} title='Payment cancelled'>
					<p>You weren&apos;t charged. You can try again from the template page.</p>
					<Actions>{back}</Actions>
				</ResultCard>
			) : (
				<ResultCard icon={Loader2} spin title='Your payment is being confirmed'>
					<p>Waiting for confirmation from the payment provider…</p>
				</ResultCard>
			);
		case "EXPIRED":
			return (
				<ResultCard icon={Clock} title='Checkout session expired'>
					<p>No payment was taken. Start a new checkout to buy this template.</p>
					<Actions>{back}</Actions>
				</ResultCard>
			);
		case "RECONCILIATION_REQUIRED":
			return (
				<ResultCard icon={AlertTriangle} tone='warning' title='Your payment is under review'>
					<p>
						We received a payment we need to check by hand. Please don&apos;t pay
						again; we&apos;ll resolve it, or contact support with this purchase.
					</p>
					<Actions>{back}</Actions>
				</ResultCard>
			);
		case "REFUNDED":
			return (
				<ResultCard icon={XCircle} title='Payment refunded'>
					<p>This payment was refunded, so it doesn&apos;t include the template.</p>
					<Actions>{back}</Actions>
				</ResultCard>
			);
		case "FAILED":
			return (
				<ResultCard icon={XCircle} tone='destructive' title='Payment failed'>
					<p>No payment was taken. You can try again from the template page.</p>
					<Actions>{back}</Actions>
				</ResultCard>
			);
	}
}

const toneClass = {
	default: "text-muted-foreground",
	success: "text-emerald-500",
	warning: "text-amber-500",
	destructive: "text-destructive",
} as const;

function ResultCard({
	icon: Icon,
	title,
	tone = "default",
	spin = false,
	children,
}: {
	icon: LucideIcon;
	title: string;
	tone?: keyof typeof toneClass;
	spin?: boolean;
	children: ReactNode;
}) {
	return (
		<section className='mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-16 text-center'>
			<div
				role='status'
				aria-live='polite'
				className='flex w-full flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-8 text-sm text-muted-foreground shadow-sm'
			>
				<Icon
					className={`size-10 ${toneClass[tone]} ${spin ? "animate-spin" : ""}`}
					aria-hidden
				/>
				<h1 className='text-lg font-semibold text-foreground'>{title}</h1>
				{children}
			</div>
		</section>
	);
}

function Actions({ children }: { children: ReactNode }) {
	return (
		<div className='mt-2 flex w-full flex-col justify-center gap-2 sm:flex-row'>
			{children}
		</div>
	);
}

function BackToTemplate({ href }: { href: string }) {
	return (
		<Button asChild variant='outline'>
			<Link href={href}>Back to template</Link>
		</Button>
	);
}
