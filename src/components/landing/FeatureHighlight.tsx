import { FileText, CheckSquare, Link as LinkIcon, RefreshCw } from "lucide-react";

const productivityCards = [
	{
		title: "Rich Document Editor",
		description:
			"Write specs, meeting notes, and wikis with a powerful block-based editor.",
		icon: FileText,
		className: "md:col-span-2",
		visual: (
			<div className='flex h-full flex-col gap-3 p-6'>
				<div className='h-4 w-3/4 rounded-md bg-foreground/20 mb-2' />
				<div className='h-2 w-full rounded-full bg-muted-foreground/20' />
				<div className='h-2 w-5/6 rounded-full bg-muted-foreground/20' />
                <div className='h-16 w-full rounded-xl border border-border bg-background/50 mt-2 p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='h-3 w-3 rounded-sm bg-primary/40' />
                        <div className='h-2 w-1/3 rounded-full bg-muted-foreground/30' />
                    </div>
                    <div className='h-2 w-full rounded-full bg-muted-foreground/20' />
                </div>
			</div>
		),
	},
	{
		title: "Advanced Kanban & Lists",
		description: "Manage work states, assignees, and due dates effortlessly.",
		icon: CheckSquare,
		className: "md:col-span-1",
		visual: (
			<div className='flex h-full gap-3 p-4 overflow-hidden'>
                {[1, 2].map((col) => (
                    <div key={col} className='flex-1 flex flex-col gap-2 rounded-xl bg-background/50 p-2'>
                        <div className='h-2 w-1/2 rounded-full bg-muted-foreground/30 mb-1' />
                        {[1, 2].map((card) => (
                            <div key={card} className='h-10 w-full rounded-lg bg-card border border-border shadow-sm' />
                        ))}
                    </div>
                ))}
			</div>
		),
	},
	{
		title: "Everything Connected",
		description: "Tag issues directly inside your documents. They stay synced automatically.",
		icon: LinkIcon,
		className: "md:col-span-1",
		visual: (
			<div className='flex h-full items-center justify-center p-6'>
				<div className='relative h-20 w-full rounded-xl border border-border bg-card p-4 shadow-sm'>
                    <div className='h-2 w-full bg-muted-foreground/20 rounded-full mb-4' />
                    <div className='inline-flex items-center gap-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary border border-primary/20'>
                        <LinkIcon className='h-2.5 w-2.5' /> PROJ-123
                    </div>
                    <div className='absolute -bottom-3 -right-3 h-12 w-12 rounded-full bg-primary/10 blur-xl' />
				</div>
			</div>
		),
	},
	{
		title: "Real-time Collaboration",
		description:
			"Work together simultaneously. See cursors, changes, and comments instantly.",
		icon: RefreshCw,
		className: "md:col-span-2",
		visual: (
			<div className='relative flex h-full items-center justify-center p-6'>
				<div className='h-24 w-full rounded-xl border border-border bg-background p-5 flex flex-col gap-3 relative'>
                    <div className='h-2 w-full bg-muted-foreground/20 rounded-full' />
                    <div className='h-2 w-3/4 bg-primary/40 rounded-full relative'>
                        {/* Cursor mockup */}
                        <div className='absolute right-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary' />
                        <div className='absolute -right-2 top-3 rounded bg-primary px-1.5 py-0.5 text-[8px] font-semibold text-primary-foreground'>Alex</div>
                    </div>
                    <div className='h-2 w-5/6 bg-muted-foreground/20 rounded-full' />
                </div>
			</div>
		),
	},
];

const FeatureHighlight = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl'>
			<div className='text-center animate-in fade-in slide-in-from-bottom-4 duration-1000'>
				<h2 className='text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl'>
					Write, plan, and execute in one place.
				</h2>

				<p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground'>
					Ditch the fragmented tools. Taskmanly brings your team's documents
					and task tracking together, creating a true single source of truth.
				</p>
			</div>

			<div className='mt-16 grid gap-6 md:grid-cols-3'>
				{productivityCards.map((card, i) => (
					<div
						key={card.title}
						className={`group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-${i * 100} ${card.className}`}
					>
						<div className='p-8'>
							<card.icon className='mb-4 h-6 w-6 text-primary' />
							<h3 className='text-xl font-semibold text-foreground'>
								{card.title}
							</h3>
							<p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
								{card.description}
							</p>
						</div>

						<div className='h-48 bg-muted/50 transition-colors group-hover:bg-muted'>
							{card.visual}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default FeatureHighlight;
