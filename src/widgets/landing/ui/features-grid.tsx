import { CORE_FEATURES } from "../data/marketing-data";
import { FeatureCard } from "./feature-card";
import { MarketingContainer } from "./marketing-container";
import { SectionHeading } from "./section-heading";

export function FeaturesGrid() {
	return (
		<section id='features' className='py-16 sm:py-24 relative'>
			<MarketingContainer>
				{/* Standardized Section Heading */}
				<SectionHeading
					eyebrow='Core Platform'
					title='Everything you need in one place'
					description='Stop switching between fragmented documentation tools and databases. Taskmanly brings your knowledge, structured views, permissions, and AI into one connected flow.'
					className='mb-12 sm:mb-16'
				/>

				{/* 6 Features Grid: 3 cols on desktop, 2 on tablet, 1 on mobile */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
					{CORE_FEATURES.map((feature) => (
						<FeatureCard
							key={feature.id}
							feature={feature}
							href={`/features#${feature.id}`}
						/>
					))}
				</div>
			</MarketingContainer>
		</section>
	);
}
