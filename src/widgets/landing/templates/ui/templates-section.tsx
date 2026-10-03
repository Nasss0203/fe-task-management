"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate, Search } from "lucide-react";
import {
	MARKETING_TEMPLATES,
	TEMPLATE_CATEGORIES,
} from "../../data/marketing-data";
import TemplateCard from "./template-card";

export default function TemplatesSection() {
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Instant client-side search and filtering over static marketing dataset
	const filteredTemplates = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return MARKETING_TEMPLATES.filter((template) => {
			const matchesCategory =
				selectedCategory === "All" || template.category === selectedCategory;

			const matchesSearch =
				!query ||
				(template.name && template.name.toLowerCase().includes(query)) ||
				(template.title && template.title.toLowerCase().includes(query)) ||
				(template.description && template.description.toLowerCase().includes(query)) ||
				template.tags.some((tag) => tag.toLowerCase().includes(query));

			return matchesCategory && matchesSearch;
		});
	}, [selectedCategory, searchQuery]);

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
						Jumpstart your setup with proven structures for team wikis, meeting notes, knowledge bases, content calendars, and personal planners.
					</p>
				</div>

				{/* Search & Category Filter Controls */}
				<div className='mb-10 space-y-4'>
					{/* Search Field */}
					<div className='relative max-w-md w-full'>
						<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<input
							type='text'
							placeholder='Search templates by name, keyword, or tag...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full h-11 pl-10 pr-4 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-xs'
						/>
					</div>

					{/* Filter Chips */}
					<div className='flex flex-wrap items-center gap-2 pt-1'>
						{TEMPLATE_CATEGORIES.map((category) => {
							const isSelected = selectedCategory === category;
							return (
								<button
									key={category}
									type='button'
									onClick={() => setSelectedCategory(category)}
									className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
										isSelected
											? "bg-primary text-primary-foreground shadow-xs font-semibold"
											: "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
									}`}
								>
									{category}
								</button>
							);
						})}
					</div>
				</div>

				{/* Template Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
					{filteredTemplates.map((template) => (
						<TemplateCard key={template.id} item={template} />
					))}

					{filteredTemplates.length === 0 && (
						<div className='col-span-full py-16 text-center text-muted-foreground rounded-2xl border border-dashed border-border/80 bg-card/40 p-8'>
							<p className='text-sm font-medium text-foreground'>No templates found</p>
							<p className='text-xs text-muted-foreground mt-1'>
								Try another search keyword or select a different category filter.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
