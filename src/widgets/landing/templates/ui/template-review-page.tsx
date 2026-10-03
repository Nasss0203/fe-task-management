"use client";

import { useMemo } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	LayoutTemplate,
	PlayCircle,
} from "lucide-react";
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	MARKETING_TEMPLATES,
	type MarketingTemplate,
} from "../../data/marketing-data";
import TemplatePreview from "./template-preview";
import TemplateCard from "./template-card";

interface TemplateReviewPageProps {
	template?: MarketingTemplate;
}

export default function TemplateReviewPage({ template: propTemplate }: TemplateReviewPageProps) {
	const params = useParams();
	const templateId = (params?.templateId as string) || "";
	const { user } = useUser();

	// Resolve template statically from local marketing data
	const template: MarketingTemplate | undefined = useMemo(() => {
		if (propTemplate) return propTemplate;
		return MARKETING_TEMPLATES.find(
			(t) => t.id === templateId || t.slug === templateId
		);
	}, [propTemplate, templateId]);

	if (!template) {
		notFound();
	}

	// Calculate similar templates locally based on category or overlapping tags
	const similarTemplates = useMemo(() => {
		return MARKETING_TEMPLATES.filter(
			(t) =>
				t.id !== template.id &&
				t.slug !== template.slug &&
				(t.category === template.category ||
					t.tags.some((tag) => template.tags.includes(tag)))
		).slice(0, 3);
	}, [template]);

	const ctaHref = user ? "/dashboard" : "/sign-up";

	return (
		<div className='py-10 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
			{/* Breadcrumb Back */}
			<Link
				href='/templates'
				className='inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors'
			>
				<ArrowLeft className='mr-1.5 h-3.5 w-3.5' />
				Back to all templates
			</Link>

			{/* Template Header Section */}
			<div className='space-y-6'>
				<div className='flex flex-wrap items-center gap-2.5'>
					<Badge variant='secondary' className='text-xs font-semibold bg-primary/10 text-primary border-none'>
						{template.category}
					</Badge>
					{template.tags.map((tag) => (
						<span
							key={tag}
							className='text-[11px] px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium'
						>
							{tag}
						</span>
					))}
				</div>

				<div className='flex flex-col md:flex-row md:items-start justify-between gap-6'>
					<div className='space-y-3 max-w-2xl'>
						<div className='flex items-center gap-3'>
							<div className='h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20'>
								<LayoutTemplate className='h-5 w-5' />
							</div>
							<h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
								{template.name || template.title}
							</h1>
						</div>

						<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
							{template.description}
						</p>
					</div>

					<div className='flex flex-col sm:flex-row gap-3 shrink-0'>
						<Link href={ctaHref}>
							<Button
								size='lg'
								className='h-12 w-full sm:w-auto px-7 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90'
							>
								Use this template
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Large Visual Preview Box */}
			<div className='mt-10 rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xl overflow-hidden'>
				<div className='flex items-center justify-between pb-4 border-b border-border/60 text-xs text-muted-foreground mb-4'>
					<span className='font-semibold text-foreground flex items-center gap-1.5'>
						<PlayCircle className='h-4 w-4 text-primary' />
						Interactive Layout Preview
					</span>
					<span className='font-mono text-[11px]'>Mode: Read-only Demo</span>
				</div>

				<div className='relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border/50 bg-muted/20'>
					<TemplatePreview previewType={template.previewType} variant={template.variant} />
				</div>
			</div>

			{/* About this template & What's included */}
			<div className='mt-14 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border/60 pt-10'>
				{/* About column */}
				<div className='space-y-4'>
					<h2 className='text-xl font-bold text-foreground'>About this template</h2>
					<p className='text-sm text-muted-foreground leading-relaxed'>
						Built by workflow architects to help squads launch initiatives with clear documentation, structured properties, and zero setup friction.
					</p>
					<p className='text-sm text-muted-foreground leading-relaxed'>
						Once applied to your workspace, all properties, columns, views, and cards can be fully customized, renamed, or linked to existing documents.
					</p>
				</div>

				{/* What's included column */}
				<div className='space-y-4'>
					<h2 className='text-xl font-bold text-foreground'>What&apos;s included</h2>
					<div className='space-y-2.5 text-sm'>
						{(template.included || template.features || []).map((feature) => (
							<div key={feature} className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>{feature}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Similar Templates Recommendation Row */}
			{similarTemplates.length > 0 && (
				<div className='mt-20 border-t border-border/60 pt-12 space-y-8'>
					<div className='flex items-center justify-between'>
						<div>
							<h2 className='text-xl sm:text-2xl font-bold text-foreground'>
								Similar templates
							</h2>
							<p className='text-xs text-muted-foreground mt-1'>
								Explore related setups for your squad
							</p>
						</div>

						<Link href='/templates'>
							<Button variant='ghost' size='sm' className='text-xs'>
								View all templates
								<ArrowRight className='ml-1.5 h-3.5 w-3.5' />
							</Button>
						</Link>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'>
						{similarTemplates.map((sim) => (
							<TemplateCard key={sim.id} item={sim} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
