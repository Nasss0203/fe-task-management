import type { Metadata } from "next";

import { CheckoutResultView } from "@/features/template-purchase";

export const metadata: Metadata = {
	title: "Checkout — Taskmanly",
	robots: { index: false },
};

type CheckoutReturnPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Stripe return URL (STRIPE_MARKETPLACE_CHECKOUT_SUCCESS_URL). */
export default async function CheckoutSuccessPage({
	searchParams,
}: CheckoutReturnPageProps) {
	const { purchaseId } = await searchParams;

	return (
		<CheckoutResultView
			purchaseId={typeof purchaseId === "string" ? purchaseId : null}
			outcome='success'
		/>
	);
}
