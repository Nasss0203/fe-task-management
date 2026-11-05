"use client";

import { PublicTemplateGallery } from "./public-template-gallery";

export default function TemplatesSection() {
	return (
		<section className='relative overflow-hidden py-12 sm:py-20'>
			{/* Subtle architectural grid backdrop in hero */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:32px_32px] text-foreground opacity-[0.035] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]'
			/>

			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Page Hero */}
				<div className='max-w-3xl mb-12 sm:mb-14 space-y-4'>
					<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
						<span>Curated Starter Frameworks</span>
					</div>

					<h1 className='text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]'>
						Templates for every{" "}
						<span className='text-muted-foreground font-semibold'>
							team and workflow.
						</span>
					</h1>

					<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
						Jumpstart your setup with ready-to-use templates for
						docs, databases, knowledge bases, and team workflows.
					</p>
				</div>

				<PublicTemplateGallery
					detailHref={(templateId) => `/templates/${templateId}`}
				/>
			</div>
		</section>
	);
}
