"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/widgets/landing/data/marketing-data";

interface TemplatesSearchAndFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	selectedCategory?: string;
	onCategoryChange?: (category: string) => void;
	showCategories?: boolean;
}

export function TemplatesSearchAndFilters({
	searchQuery,
	onSearchChange,
	selectedCategory = "All",
	onCategoryChange,
	showCategories = false,
}: TemplatesSearchAndFiltersProps) {
	return (
		<div className='flex flex-col gap-4'>
			{/* Search Field */}
			<div className='relative max-w-md w-full'>
				<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
				<input
					type='text'
					placeholder='Search templates...'
					aria-label='Search templates'
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className='w-full h-10 pl-10 pr-9 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-xs'
				/>
				{searchQuery && (
					<button
						type='button'
						onClick={() => onSearchChange("")}
						aria-label='Clear search'
						className='absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
					>
						<X className='size-3.5' />
					</button>
				)}
			</div>

			{/* Category Filter Chips - Only shown for Explore tab */}
			{showCategories && onCategoryChange && (
				<div className='flex flex-wrap items-center gap-2 pt-0.5'>
					{TEMPLATE_CATEGORIES.map((category) => {
						const isSelected = selectedCategory === category;
						return (
							<button
								key={category}
								type='button'
								onClick={() => onCategoryChange(category)}
								className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
			)}
		</div>
	);
}
