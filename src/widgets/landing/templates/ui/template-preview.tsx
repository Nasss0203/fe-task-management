import React from "react";
import type { TemplatePreviewType } from "../../data/marketing-data";

type TemplatePreviewProps = {
	variant?: string;
	previewType?: TemplatePreviewType | string;
};

export default function TemplatePreview({ variant, previewType }: TemplatePreviewProps) {
	const type = previewType || variant || "wiki";

	// 1. Team Wiki: Nested page hierarchy with breadcrumb and content blocks
	if (type === "wiki" || type === "checklist") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50 text-[10px] text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<div className='h-2.5 w-12 rounded bg-muted-foreground/30' />
						<span>/</span>
						<div className='h-2.5 w-16 rounded bg-primary/40 font-semibold' />
					</div>
					<div className='h-2 w-8 rounded bg-muted-foreground/20' />
				</div>

				<div className='space-y-2 py-2'>
					<div className='h-3.5 w-3/4 rounded-md bg-foreground/20 font-bold' />
					<div className='h-2 w-full rounded bg-muted-foreground/20' />
					<div className='h-2 w-5/6 rounded bg-muted-foreground/15' />

					{/* Nested children links */}
					<div className='grid grid-cols-2 gap-2 pt-1.5'>
						<div className='flex items-center gap-1.5 p-1.5 rounded-lg border border-border/60 bg-muted/30'>
							<div className='h-2 w-2 rounded-full bg-blue-500' />
							<div className='h-2 w-16 rounded bg-foreground/20' />
						</div>
						<div className='flex items-center gap-1.5 p-1.5 rounded-lg border border-border/60 bg-muted/30'>
							<div className='h-2 w-2 rounded-full bg-indigo-500' />
							<div className='h-2 w-14 rounded bg-foreground/20' />
						</div>
					</div>
				</div>

				<div className='flex items-center gap-2 pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<div className='h-2 w-2 rounded-full bg-emerald-500' />
					<span>Live Workspace Sync</span>
				</div>
			</div>
		);
	}

	// 2. Meeting Notes: Agendas and actionable checklists
	if (type === "notes" || type === "meeting") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='flex items-center gap-2'>
						<div className='h-2.5 w-20 rounded bg-foreground/30' />
						<span className='text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold'>
							Weekly Sync
						</span>
					</div>
					<div className='h-2 w-10 rounded bg-muted-foreground/30' />
				</div>

				<div className='space-y-2 py-1'>
					<div className='flex items-center gap-2'>
						<div className='h-3 w-3 rounded border border-primary/50 bg-primary/20 flex items-center justify-center' />
						<div className='h-2 w-3/4 rounded bg-foreground/25' />
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-3 w-3 rounded border border-primary/50 bg-primary/20 flex items-center justify-center' />
						<div className='h-2 w-2/3 rounded bg-foreground/25' />
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-3 w-3 rounded border border-border bg-background' />
						<div className='h-2 w-4/5 rounded bg-muted-foreground/30' />
					</div>
				</div>

				<div className='p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between'>
					<div className='h-2 w-24 rounded bg-foreground/20' />
					<div className='h-3 w-8 rounded bg-emerald-500/20' />
				</div>
			</div>
		);
	}

	// 3. Knowledge Base: Hub with categories and article cards
	if (type === "knowledge" || type === "mindmap") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='h-3 w-28 rounded bg-foreground/30 font-bold' />
					<div className='h-2 w-12 rounded-full bg-primary/30' />
				</div>

				<div className='grid grid-cols-3 gap-2 py-1.5'>
					<div className='rounded-lg border border-border/60 bg-muted/30 p-2 space-y-1.5'>
						<div className='h-2 w-2 rounded-full bg-blue-500' />
						<div className='h-2 w-full rounded bg-foreground/20' />
						<div className='h-1.5 w-2/3 rounded bg-muted-foreground/20' />
					</div>
					<div className='rounded-lg border border-border/60 bg-muted/30 p-2 space-y-1.5'>
						<div className='h-2 w-2 rounded-full bg-purple-500' />
						<div className='h-2 w-full rounded bg-foreground/20' />
						<div className='h-1.5 w-2/3 rounded bg-muted-foreground/20' />
					</div>
					<div className='rounded-lg border border-border/60 bg-muted/30 p-2 space-y-1.5'>
						<div className='h-2 w-2 rounded-full bg-emerald-500' />
						<div className='h-2 w-full rounded bg-foreground/20' />
						<div className='h-1.5 w-2/3 rounded bg-muted-foreground/20' />
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>Search across 24 docs</span>
					<div className='h-2 w-14 rounded bg-primary/20' />
				</div>
			</div>
		);
	}

	// 4. Content Calendar: Database calendar grid
	if (type === "database-calendar" || type === "timeline") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='h-2.5 w-24 rounded bg-foreground/30 font-semibold' />
					<div className='flex items-center gap-1'>
						<span className='h-2 w-6 rounded bg-primary/30' />
						<span className='h-2 w-6 rounded bg-muted' />
					</div>
				</div>

				<div className='grid grid-cols-4 gap-1.5 py-1 text-center text-[9px]'>
					<div className='p-1.5 rounded-lg border border-border/50 bg-background space-y-1'>
						<div className='text-muted-foreground text-[8px]'>Mon</div>
						<div className='h-2 w-full rounded bg-blue-500/30' />
					</div>
					<div className='p-1.5 rounded-lg border border-border/50 bg-background space-y-1'>
						<div className='text-muted-foreground text-[8px]'>Tue</div>
						<div className='h-2 w-full rounded bg-emerald-500/30' />
					</div>
					<div className='p-1.5 rounded-lg border border-border/50 bg-background space-y-1'>
						<div className='text-muted-foreground text-[8px]'>Wed</div>
						<div className='h-2 w-full rounded bg-purple-500/30' />
					</div>
					<div className='p-1.5 rounded-lg border border-border/50 bg-background space-y-1'>
						<div className='text-muted-foreground text-[8px]'>Thu</div>
						<div className='h-2 w-full rounded bg-amber-500/30' />
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>View: Editorial Calendar</span>
					<span className='text-primary font-semibold'>4 Posts</span>
				</div>
			</div>
		);
	}

	// 5. CRM: Database table of contacts
	if (type === "crm") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50 text-[10px]'>
					<div className='h-2.5 w-24 rounded bg-foreground/30 font-semibold' />
					<span className='px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-semibold'>
						Pipeline View
					</span>
				</div>

				<div className='space-y-1.5 py-1 text-[9px]'>
					<div className='flex items-center justify-between p-1.5 rounded-lg bg-background border border-border/60'>
						<div className='flex items-center gap-1.5'>
							<div className='h-4 w-4 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-[8px]'>
								A
							</div>
							<div className='h-2 w-16 rounded bg-foreground/30' />
						</div>
						<span className='px-1 rounded bg-blue-500/10 text-blue-600 text-[8px]'>Qualified</span>
					</div>

					<div className='flex items-center justify-between p-1.5 rounded-lg bg-background border border-border/60'>
						<div className='flex items-center gap-1.5'>
							<div className='h-4 w-4 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-[8px]'>
								S
							</div>
							<div className='h-2 w-18 rounded bg-foreground/30' />
						</div>
						<span className='px-1 rounded bg-purple-500/10 text-purple-600 text-[8px]'>Proposal</span>
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>Relational Database Table</span>
					<span className='font-mono'>$48,000</span>
				</div>
			</div>
		);
	}

	// 6. Company Handbook
	if (type === "handbook") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='h-3 w-32 rounded bg-foreground/30 font-bold' />
					<div className='h-2 w-10 rounded bg-muted-foreground/30' />
				</div>

				<div className='space-y-2 py-1 text-[9px]'>
					<div className='p-2 rounded-lg bg-primary/5 border border-primary/20 space-y-1'>
						<div className='h-2 w-1/3 rounded bg-primary/40 font-semibold' />
						<div className='h-1.5 w-full rounded bg-foreground/20' />
					</div>
					<div className='grid grid-cols-2 gap-1.5'>
						<div className='p-1.5 rounded-lg bg-background border border-border/60'>
							<div className='h-2 w-14 rounded bg-foreground/30' />
						</div>
						<div className='p-1.5 rounded-lg bg-background border border-border/60'>
							<div className='h-2 w-16 rounded bg-foreground/30' />
						</div>
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>Publicly publishable</span>
					<span className='text-emerald-600 font-semibold'>Ready</span>
				</div>
			</div>
		);
	}

	// 7. Research Notes
	if (type === "research") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='h-2.5 w-24 rounded bg-foreground/30 font-semibold' />
					<div className='h-2 w-8 rounded bg-muted-foreground/30' />
				</div>

				<div className='grid grid-cols-2 gap-2 py-1 text-[9px]'>
					<div className='space-y-1.5 p-2 rounded-lg bg-muted/30 border border-border/50'>
						<div className='h-2 w-12 rounded bg-primary/40 font-semibold' />
						<div className='h-1.5 w-full rounded bg-foreground/20' />
						<div className='h-1.5 w-4/5 rounded bg-muted-foreground/20' />
					</div>
					<div className='space-y-1.5 p-2 rounded-lg bg-background border border-border/50'>
						<div className='h-2 w-14 rounded bg-foreground/30' />
						<div className='h-1.5 w-full rounded bg-muted-foreground/20' />
						<div className='h-1.5 w-3/4 rounded bg-muted-foreground/20' />
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>Sources & Citations</span>
					<span>3 Linked Refs</span>
				</div>
			</div>
		);
	}

	// 8. Personal Planner
	if (type === "planner") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='h-2.5 w-24 rounded bg-foreground/30 font-semibold' />
					<span className='text-[8px] font-bold text-primary'>Today</span>
				</div>

				<div className='space-y-1.5 py-1 text-[9px]'>
					<div className='flex items-center justify-between p-1.5 rounded-lg bg-background border border-border/60'>
						<div className='flex items-center gap-1.5'>
							<div className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
							<div className='h-2 w-24 rounded bg-foreground/25' />
						</div>
						<div className='h-2 w-8 rounded bg-emerald-500/20' />
					</div>
					<div className='flex items-center justify-between p-1.5 rounded-lg bg-background border border-border/60'>
						<div className='flex items-center gap-1.5'>
							<div className='h-2.5 w-2.5 rounded-full bg-amber-500' />
							<div className='h-2 w-20 rounded bg-foreground/25' />
						</div>
						<div className='h-2 w-8 rounded bg-amber-500/20' />
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>Weekly Progress</span>
					<span className='font-semibold text-foreground'>80%</span>
				</div>
			</div>
		);
	}

	// 9. Reading List
	if (type === "reading-list") {
		return (
			<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
				<div className='flex items-center justify-between pb-2 border-b border-border/50'>
					<div className='h-2.5 w-20 rounded bg-foreground/30 font-semibold' />
					<span className='text-[9px] text-muted-foreground'>Books & Articles</span>
				</div>

				<div className='space-y-1.5 py-1 text-[9px]'>
					<div className='flex items-center justify-between p-1.5 rounded-lg bg-background border border-border/60'>
						<div className='h-2 w-28 rounded bg-foreground/30 font-medium' />
						<span className='px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[8px] font-semibold'>
							Reading
						</span>
					</div>
					<div className='flex items-center justify-between p-1.5 rounded-lg bg-background border border-border/60'>
						<div className='h-2 w-24 rounded bg-foreground/30 font-medium' />
						<span className='px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[8px] font-semibold'>
							Done ★★★★★
						</span>
					</div>
				</div>

				<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
					<span>Database with Ratings</span>
					<span>12 Titles</span>
				</div>
			</div>
		);
	}

	// 10. Team Directory / Default fallback
	return (
		<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
			<div className='flex items-center justify-between pb-2 border-b border-border/50'>
				<div className='h-2.5 w-24 rounded bg-foreground/30 font-semibold' />
				<span className='text-[9px] text-muted-foreground'>Directory</span>
			</div>

			<div className='grid grid-cols-2 gap-2 py-1 text-[9px]'>
				<div className='flex items-center gap-2 p-1.5 rounded-lg bg-background border border-border/60'>
					<div className='h-5 w-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[8px]'>
						A
					</div>
					<div>
						<div className='h-2 w-12 rounded bg-foreground/30' />
						<div className='h-1.5 w-8 rounded bg-muted-foreground/20 mt-1' />
					</div>
				</div>
				<div className='flex items-center gap-2 p-1.5 rounded-lg bg-background border border-border/60'>
					<div className='h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-[8px]'>
						N
					</div>
					<div>
						<div className='h-2 w-12 rounded bg-foreground/30' />
						<div className='h-1.5 w-10 rounded bg-muted-foreground/20 mt-1' />
					</div>
				</div>
			</div>

			<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
				<span>Department: Engineering</span>
				<span className='text-emerald-500 font-semibold'>Active</span>
			</div>
		</div>
	);
}
