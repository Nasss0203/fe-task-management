"use client";

import { LayoutTemplate } from "lucide-react";

import { PublicTemplateGallery } from "./public-template-gallery";

export default function TemplatesSection() {
	return (
		<section className='py-12 sm:py-20'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Page Hero */}
				<div className='max-w-3xl mb-12 sm:mb-14'>
					<div className='inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-4'>
						<LayoutTemplate className='h-3.5 w-3.5' />
						Curated Starter Frameworks
					</div>

					<h1 className='text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]'>
						Templates for every team and workflow
					</h1>

					<p className='mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed'>
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
