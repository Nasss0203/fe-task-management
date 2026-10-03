"use client";

import { ArrowRight, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MARKETING_TEMPLATES } from "../data/marketing-data";
import TemplatePreview from "../templates/ui/template-preview";

export function HomeTemplatesShowcase() {
	const { user } = useUser();
	const ctaHref = user ? "/dashboard" : "/sign-up";

	// Pick top 3 featured templates for Home showcase
	const showcaseTemplates = MARKETING_TEMPLATES.filter((t) => t.featured).slice(0, 3);

	return (
		<section className='py-20 sm:py-28 relative bg-muted/20 border-y border-border/60'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16'>
					<div className='max-w-xl space-y-3'>
						<div className='inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400'>
							<LayoutTemplate className='h-3.5 w-3.5' />
							Curated Starter Frameworks
						</div>
						<h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground'>
							Start faster with templates
						</h2>
						<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
							Jumpstart your workspace with curated setups for team wikis, meeting notes, knowledge bases, and structured databases.
						</p>
					</div>

					<Link href='/templates'>
						<Button variant='outline' className='rounded-full group'>
							Explore all templates
							<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
						</Button>
					</Link>
				</div>

				{/* 3 Template Cards Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
					{showcaseTemplates.map((template) => (
						<div
							key={template.id}
							className='group flex flex-col h-full rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
						>
							{/* Visual Preview Box */}
							<div className='relative h-44 w-full rounded-xl overflow-hidden border border-border/50 bg-muted/30 mb-4 shrink-0'>
								<TemplatePreview previewType={template.previewType} variant={template.variant} />
								<div className='absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none' />
								<Badge className='absolute top-2.5 right-2.5 bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs'>
									{template.category}
								</Badge>
							</div>

							{/* Content */}
							<div className='flex-1 flex flex-col'>
								<h3 className='text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1'>
									{template.name || template.title}
								</h3>
								<p className='mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1'>
									{template.description}
								</p>

								{/* Tags */}
								<div className='mt-4 flex flex-wrap gap-1.5'>
									{template.tags.slice(0, 3).map((tag) => (
										<span
											key={tag}
											className='text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium'
										>
											{tag}
										</span>
									))}
								</div>

								{/* Action Buttons */}
								<div className='mt-5 pt-3 border-t border-border/50 flex items-center justify-between gap-2'>
									<Link href={`/templates/${template.slug || template.id}`} className='flex-1'>
										<Button
											variant='outline'
											size='sm'
											className='w-full rounded-lg text-xs font-medium'
										>
											Preview
										</Button>
									</Link>
									<Link href={ctaHref} className='flex-1'>
										<Button
											size='sm'
											className='w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90'
										>
											Use template
										</Button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
