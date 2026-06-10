import {
	CalendarDays,
	CheckCircle2,
	FolderKanban,
	LayoutGrid,
	ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const departmentTabs = [
	"Engineering",
	"Product",
	"Marketing",
	"Operations",
	"Company-wide",
];

const engineeringPoints = [
	"Write technical specs and link directly to tracking issues.",
	"Track sprint progress with integrated Kanban boards.",
	"Collaborate on architectural decisions in real-time.",
];

const DepartmentUseCase = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300'>
			<div className='grid gap-12 lg:grid-cols-2 lg:items-start'>
				<div>
					<h2 className='text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl'>
						Built for every workflow.
					</h2>
				</div>

				<div>
					<p className='text-lg text-muted-foreground'>
						Discover how different teams use Taskmanly to track work
						and document knowledge side-by-side, without missing a beat.
					</p>
				</div>
			</div>

			<div className='mt-12 flex flex-wrap gap-3'>
				{departmentTabs.map((tab, index) => (
					<button
						key={tab}
						type='button'
						className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-all ${
							index === 0
								? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
								: "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			<div className='mt-12 grid gap-12 lg:grid-cols-2'>
				<div className='group relative overflow-hidden rounded-[32px] border border-border bg-card p-2'>
					<div className='aspect-[4/3] overflow-hidden rounded-[24px] bg-muted/50 p-8 transition-colors group-hover:bg-muted'>
						<div className='flex h-full flex-col'>
							<div className='mb-8 flex items-center justify-between'>
								<div className='flex items-center gap-4'>
									<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20'>
										<FolderKanban className='h-6 w-6' />
									</div>
									<div>
										<h3 className='text-lg font-semibold text-foreground'>
											Engineering Wiki
										</h3>
										<p className='text-xs text-muted-foreground'>
											Documentation · Q3 2026
										</p>
									</div>
								</div>
								<div className='rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400'>
									Synced
								</div>
							</div>

							<div className='grid flex-1 gap-4'>
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className='rounded-2xl border border-border bg-background p-4'
									>
										<div className='h-2 w-1/3 rounded-full bg-border' />
										<div className='mt-3 space-y-2'>
											<div className='h-1.5 w-full rounded-full bg-secondary' />
											<div className='h-1.5 w-2/3 rounded-full bg-secondary' />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					{/* Decorative background glow */}
					<div className='absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />
				</div>

				<div className='flex flex-col justify-center py-8'>
					<h3 className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
						Ship faster, document better.
					</h3>

					<p className='mt-6 text-lg text-muted-foreground'>
						Maximize resource effectiveness and confidently expand
						the workflow of any sprint with precision.
					</p>

					<div className='mt-10 space-y-5'>
						{engineeringPoints.map((point) => (
							<div key={point} className='flex items-start gap-4'>
								<div className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10'>
									<CheckCircle2 className='h-3.5 w-3.5 text-primary' />
								</div>
								<p className='text-base leading-relaxed text-muted-foreground'>
									{point}
								</p>
							</div>
						))}
					</div>

					<div className='mt-12'>
						<Button className='h-12 rounded-full bg-primary px-8 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]'>
							Explore Engineering
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DepartmentUseCase;
