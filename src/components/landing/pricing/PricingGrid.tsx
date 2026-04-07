import { PricingCard } from "./PricingCard";
import type { PricingPlan } from "./pricing.types";

type PricingGridProps = {
	plans: PricingPlan[];
};

export function PricingGrid({ plans }: PricingGridProps) {
	return (
		<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
			{plans.map((plan) => (
				<PricingCard key={plan.id} plan={plan} />
			))}
		</div>
	);
}
