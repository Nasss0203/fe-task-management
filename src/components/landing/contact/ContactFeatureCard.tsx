import { LucideIcon } from "lucide-react";

type ContactFeatureCardProps = {
	title: string;
	description: string;
	icon: LucideIcon;
};

export default function ContactFeatureCard({
	title,
	description,
	icon: Icon,
}: ContactFeatureCardProps) {
	return (
		<div className='rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-md transition hover:bg-white/10'>
			<div className='flex items-start gap-4'>
				<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5'>
					<Icon className='h-5 w-5 text-violet-400' />
				</div>

				<div className='space-y-2'>
					<h3 className='text-xl font-semibold text-white'>
						{title}
					</h3>
					<p className='text-sm leading-6 text-gray-300'>
						{description}
					</p>
				</div>
			</div>
		</div>
	);
}
