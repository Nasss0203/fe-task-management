import { contactFeatures } from "./contact-data";
import ContactFeatureCard from "./ContactFeatureCard";

export default function ContactIntro() {
	return (
		<div className='space-y-8'>
			<div className='space-y-5'>
				<h1 className='max-w-xl text-4xl font-bold leading-tight tracking-tight text-black-90 md:text-5xl'>
					Supercharge Your Workflow with Taskmanly
				</h1>

				<p className='max-w-2xl text-base leading-7 text-white'>
					Welcome to the future of task management! At Taskmanly,
					we&apos;re dedicated to helping businesses like yours
					achieve peak efficiency and collaboration. Take the leap
					towards a more organized workflow.
				</p>
			</div>

			<div className='space-y-4'>
				{contactFeatures.map((feature) => (
					<ContactFeatureCard
						key={feature.id}
						title={feature.title}
						description={feature.description}
						icon={feature.icon}
					/>
				))}
			</div>
		</div>
	);
}
