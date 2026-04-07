import { PricingHeader } from "./PricingHeader";
import { PricingTabs } from "./PricingTabs";

export function PricingSection() {
	return (
		<section className='px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24'>
			<div className='mx-auto max-w-7xl'>
				<PricingHeader />
				<PricingTabs />
			</div>
		</section>
	);
}
