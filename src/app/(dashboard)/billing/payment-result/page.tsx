import { redirect } from "next/navigation";

import { PAYMENT_RESULT_PARAM } from "@/features/workspace-billing";

type PaymentResultPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Return URL configured for the payment providers. The result is shown in a
 * dialog over the workspace, so forward the provider params to the dashboard.
 */
export default async function PaymentResultPage({
	searchParams,
}: PaymentResultPageProps) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(await searchParams)) {
		if (typeof value === "string") params.set(key, value);
	}
	params.set(PAYMENT_RESULT_PARAM, "1");

	redirect(`/dashboard?${params}`);
}
