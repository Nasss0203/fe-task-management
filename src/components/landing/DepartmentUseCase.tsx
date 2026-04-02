import {
	CalendarDays,
	CheckCircle2,
	FolderKanban,
	LayoutGrid,
	ListTodo,
} from "lucide-react";
import { Button } from "../ui/button";
const departmentTabs = [
	"Marketing",
	"Operations",
	"IT",
	"Product",
	"Company-wide",
];

const marketingPoints = [
	"Enhance clarity to coordinate on evolving business requirements.",
	"Optimize outcomes during product launches.",
	"Automate and expand processes for approvals.",
];

const DepartmentUseCase = () => {
	return (
		<div className='mx-auto mt-24 max-w-6xl'>
			<div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start'>
				<div>
					<h2 className='max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
						Discover How Various Departments Use Taskmanly.
					</h2>
				</div>

				<div>
					<p className='max-w-xl text-sm leading-7 text-white/60 sm:text-base'>
						Discover how different departments utilize our platform
						to streamline workflows, improve collaboration, and
						increase productivity. Explore real-world examples
						demonstrating its transformative effects on task
						management.
					</p>
				</div>
			</div>

			<div className='mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5'>
				{departmentTabs.map((tab, index) => (
					<button
						key={tab}
						type='button'
						className={`rounded-md border px-5 py-3 text-sm font-medium transition ${
							index === 0
								? "border-white/40 bg-[#1a1a1d] text-white"
								: "border-transparent bg-[#1a1a1d] text-white/80 hover:text-white"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			<div className='mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]'>
				<div className='rounded-[28px] border border-white/10 bg-white/[0.03] p-6'>
					<div className='rounded-[22px] border border-white/10 bg-[#0d0d10] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]'>
						<div className='mb-5 flex flex-wrap items-center gap-3'>
							<div className='flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'>
								<FolderKanban className='h-5 w-5' />
							</div>

							<div>
								<p className='text-xs text-white/50'>
									Portfolio • Taskmanly 2026
								</p>
								<h3 className='text-base font-semibold text-white'>
									IT Production
								</h3>
							</div>

							<div className='ml-auto rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black'>
								On track
							</div>
						</div>

						<div className='mb-6 flex flex-wrap items-center gap-5 border-b border-white/10 pb-4 text-sm text-white/55'>
							<div className='flex items-center gap-2'>
								<ListTodo className='h-4 w-4' />
								List
							</div>
							<div className='flex items-center gap-2'>
								<LayoutGrid className='h-4 w-4' />
								Kanban
							</div>
							<div className='flex items-center gap-2'>
								<CalendarDays className='h-4 w-4' />
								Timeline
							</div>
							<div className='flex items-center gap-2'>
								<CalendarDays className='h-4 w-4' />
								Calendar
							</div>
							<div className='flex items-center gap-2 border-b-2 border-indigo-500 pb-2 text-white'>
								<FolderKanban className='h-4 w-4' />
								Gantt
							</div>
						</div>

						<div className='grid gap-4 lg:grid-cols-[0.56fr_0.44fr]'>
							<div className='rounded-2xl border border-white/10 bg-black/40 p-4'>
								<div className='mb-3 text-sm font-medium text-white'>
									Content Calendar
								</div>

								<div className='space-y-3'>
									<div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
										<div className='flex items-center gap-2 text-sm font-medium text-white'>
											<span className='text-white/70'>
												▾
											</span>
											Project Kickoff Planning
										</div>

										<div className='mt-3 space-y-2 pl-5 text-sm text-white/65'>
											<div className='flex items-center gap-2'>
												<span className='h-2 w-2 rounded-full bg-white/60' />
												Define project goals and target
												scope.
											</div>
											<div className='flex items-center gap-2'>
												<span className='h-2 w-2 rounded-full bg-white/60' />
												Identify target audience and
												user pain points.
											</div>
										</div>
									</div>

									<div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
										<div className='flex items-center gap-2 text-sm font-medium text-white'>
											<span className='text-white/70'>
												▾
											</span>
											Research and Analysis
										</div>

										<div className='mt-3 space-y-2 pl-5 text-sm text-white/65'>
											<div className='flex items-center gap-2'>
												<span className='h-2 w-2 rounded-full bg-emerald-400' />
												Conduct user research and
												surveys.
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className='rounded-2xl border border-white/10 bg-black/40 p-4'>
								<div className='mb-4 text-center text-sm font-medium text-white/80'>
									May
								</div>

								<div className='grid grid-cols-6 gap-2 text-center text-xs text-white/45'>
									<span>21</span>
									<span>22</span>
									<span>23</span>
									<span>24</span>
									<span>25</span>
									<span>26</span>
								</div>

								<div className='relative mt-4 space-y-4'>
									<div className='relative h-10 rounded-lg border border-white/5 bg-white/[0.02]'>
										<div className='absolute left-[8%] top-1/2 h-4 w-[46%] -translate-y-1/2 rounded-md bg-indigo-500' />
									</div>

									<div className='relative h-10 rounded-lg border border-white/5 bg-white/[0.02]'>
										<div className='absolute left-[34%] top-1/2 h-4 w-[30%] -translate-y-1/2 rounded-md bg-indigo-500/90' />
									</div>

									<div className='relative h-10 rounded-lg border border-white/5 bg-white/[0.02]'>
										<div className='absolute left-[70%] top-1/2 h-4 w-[16%] -translate-y-1/2 rounded-md bg-indigo-500/90' />
									</div>

									<div className='relative h-10 rounded-lg border border-white/5 bg-white/[0.02]'>
										<div className='absolute left-[82%] top-1/2 h-4 w-[12%] -translate-y-1/2 rounded-md bg-indigo-500/80' />
									</div>

									<div className='relative h-10 rounded-lg border border-white/5 bg-white/[0.02]'>
										<div className='absolute left-[88%] top-1/2 h-4 w-[8%] -translate-y-1/2 rounded-md bg-indigo-500/70' />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='flex items-center'>
					<div className='max-w-xl'>
						<h3 className='text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
							Achieve Campaign Objectives
						</h3>

						<p className='mt-5 text-sm leading-7 text-white/60 sm:text-base'>
							Fully around defined objectives, maximize resource
							effectiveness, and confidently expand the workflow
							of any campaign.
						</p>

						<div className='mt-6 space-y-4'>
							{marketingPoints.map((point) => (
								<div
									key={point}
									className='flex items-start gap-3'
								>
									<CheckCircle2 className='mt-0.5 h-5 w-5 text-white/70' />
									<p className='text-sm leading-6 text-white/70 sm:text-base'>
										{point}
									</p>
								</div>
							))}
						</div>

						<Button className='mt-8 bg-indigo-500 px-6 text-white hover:bg-indigo-400'>
							Explore Marketing
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DepartmentUseCase;
