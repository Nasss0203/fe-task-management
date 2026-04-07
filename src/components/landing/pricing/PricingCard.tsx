import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PricingPlan } from "./pricing.types";

type PricingCardProps = {
	plan: PricingPlan;
};

export function PricingCard({ plan }: PricingCardProps) {
	return (
		<div className='flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl'>
			<div className='border-b border-white/10 px-6 py-6 sm:px-7 sm:py-7'>
				<h3 className='text-2xl font-semibold text-white'>
					{plan.name}
				</h3>

				<p className='mt-3 min-h-[56px] text-sm leading-6 text-white/55'>
					{plan.description}
				</p>
			</div>

			<div className='flex flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7'>
				<div className='flex items-end gap-2'>
					<span className='text-4xl font-semibold tracking-tight text-white'>
						{plan.price}
					</span>
					<span className='pb-1 text-sm text-white/65'>
						{plan.priceSuffix}
					</span>
				</div>

				<Button className='mt-6 h-11 w-full rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-500'>
					Get Started
				</Button>

				<div className='mt-6'>
					<p className='text-sm text-white/70'>{plan.intro}</p>

					<ul className='mt-5 space-y-3'>
						{plan.features.map((feature) => (
							<li
								key={feature}
								className='flex items-start gap-3'
							>
								<CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-white/85' />
								<span className='text-sm leading-6 text-white/75'>
									{feature}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
