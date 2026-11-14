import { AlertTriangle } from "lucide-react";

import type { WorkspaceSubscription } from "@/entities/billing/model/billing.types";
import { useBillingDialog } from "@/features/workspace-billing";

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	});
}

export function PlanExpiredBanner({
	subscription,
}: {
	subscription: WorkspaceSubscription;
}) {
	const setBillingOpen = useBillingDialog((state) => state.setOpen);

	return (
		<button
			type='button'
			onClick={() => setBillingOpen(true)}
			className='mx-2 flex items-start gap-2 rounded-md bg-amber-500/10 px-2.5 py-2 text-left text-[12.5px] leading-[18px] text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-400'
		>
			<AlertTriangle aria-hidden className='mt-px size-3.5 shrink-0' />
			<span>
				<span className='font-medium'>{subscription.plan.name} plan expired.</span>{" "}
				{subscription.accessEndsAt
					? `Renew before ${formatDate(subscription.accessEndsAt)} to keep your limits.`
					: "Renew to keep your limits."}
			</span>
		</button>
	);
}
