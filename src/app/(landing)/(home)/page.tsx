import { Button } from "@/components/ui/button";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faDropbox,
	faGithub,
	faGoogle,
	faSlack,
} from "@fortawesome/free-brands-svg-icons";
import {
	faCalendarDays as faCalendarIcon,
	faTableCellsLarge,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	CalendarDays,
	CheckCircle2,
	ChevronDown,
	FolderKanban,
	LayoutGrid,
	ListTodo,
	Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navItems = [
	{ label: "Features", href: "#" },
	{ label: "Solutions", href: "#" },
	{ label: "Resources", href: "#" },
	{ label: "Enterprise", href: "#" },
	{ label: "Pricing", href: "#" },
];

const brandItems = [
	{ name: "StellarTech", icon: "✦" },
	{ name: "CascadeStyle", icon: "⬡" },
	{ name: "Braincraze", icon: "✹" },
	{ name: "StackFlow", icon: "◈" },
	{ name: "Biomark", icon: "◉" },
];

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

const productivityCards = [
	{
		title: "Effortless Task Creation",
		description:
			"Seamlessly create new tasks with ease, whether you're working individually or collaborating with your team.",
		variant: "task-creation",
	},
	{
		title: "Organization with Streamlined List View",
		description:
			"Immerse yourself in a clean and intuitive list view that enhances visibility and simplifies your workflow.",
		variant: "list-view",
	},
	{
		title: "Potential of Your Efficiency with AutoFlow",
		description:
			"Seamlessly automate repetitive tasks, streamline processes, and elevate your productivity to new heights.",
		variant: "autoflow",
	},
	{
		title: "Summaries for Enhanced Task Management",
		description:
			"Elevate your productivity with succinct task summaries that provide a quick overview of key details.",
		variant: "summary",
	},
];

const workManagementViews = [
	{
		title: "List View",
		description:
			"Organize and assign tasks. With lists, teams see immediately what they need to do, which tasks are a priority, and when work is due.",
		active: true,
	},
	{ title: "Timeline View", description: "", active: false },
	{ title: "Kanban Board", description: "", active: false },
	{ title: "Gantt Chart", description: "", active: false },
	{ title: "Calendar", description: "", active: false },
];

const integrationTools: {
	name: string;
	description: string;
	icon: IconDefinition;
	iconClassName?: string;
}[] = [
	{
		name: "Google Calendar",
		description:
			"Schedule and manage all your project-related events, meetings, and reminders with your calendar.",
		icon: faCalendarIcon,
	},
	{
		name: "Github",
		description:
			"Track code changes, manage issues, and coordinate development tasks effortlessly.",
		icon: faGithub,
	},
	{
		name: "Google Sheet",
		description:
			"Keep your project data up-to-date and visible with real-time decisions and reports.",
		icon: faTableCellsLarge,
		iconClassName: "text-emerald-400",
	},
	{
		name: "Slack",
		description:
			"Receive project updates, collaborate as a team, and keep team communication in one platform.",
		icon: faSlack,
	},
	{
		name: "Dropbox",
		description:
			"Keep all project-related documents in one central location for easy collaboration.",
		icon: faDropbox,
	},
	{
		name: "Google Workspace",
		description:
			"Bring your Google tools together to centralize team collaboration and project planning.",
		icon: faGoogle,
	},
];

const footerColumns = [
	{
		title: "Product",
		links: [
			"Home",
			"Pricing",
			"Enterprise",
			"Customer Success",
			"Trust & Security",
			"App & Integration",
			"Template",
		],
	},
	{
		title: "Solution",
		links: [
			"Project Management",
			"Increase Productivity",
			"Agile Workflows",
			"Mind Map",
			"Strategy & Planning",
			"Goal Management",
			"Work Management",
		],
	},
	{
		title: "Resources",
		links: [
			"Help Center",
			"Blog",
			"Community",
			"Support",
			"Developer & API",
			"Partners",
			"Accessibility",
		],
	},
	{
		title: "Company",
		links: [
			"About Us",
			"Careers",
			"Press",
			"Sitemap",
			"Investor Relations",
			"Customers",
			"Affiliates",
		],
	},
];

function ProductivityMockup({ variant }: { variant: string }) {
	if (variant === "task-creation") {
		return (
			<div className='rounded-[20px] border border-white/10 bg-[#0c0c0f] p-4'>
				<div className='flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/55'>
					<span>New task</span>
					<span>— ×</span>
				</div>

				<div className='mt-4 space-y-4'>
					<div className='text-sm text-white'>
						Please review this document
					</div>

					<div>
						<div className='mb-2 text-xs text-white/50'>For</div>
						<div className='flex flex-wrap gap-2'>
							<span className='rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70'>
								Michael Brown
							</span>
							<span className='rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70'>
								Schedule kickoff with team
							</span>
						</div>
					</div>

					<div>
						<div className='mb-2 text-xs text-white/50'>
							Description
						</div>
						<div className='space-y-2'>
							<div className='h-2 rounded-full bg-white/[0.06]' />
							<div className='h-2 rounded-full bg-white/[0.06]' />
							<div className='h-2 w-4/5 rounded-full bg-white/[0.06]' />
						</div>
					</div>

					<div className='flex items-center justify-between pt-3'>
						<div className='flex items-center gap-3 text-white/50'>
							<span>＋</span>
							<span>Aa</span>
							<span>◔</span>
							<span className='rounded-full border border-white/10 px-3 py-1 text-xs text-white/65'>
								Apr 6, 5:00pm
							</span>
						</div>

						<div className='rounded-md bg-indigo-500 px-3 py-2 text-xs font-medium text-white'>
							Create Task
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (variant === "list-view") {
		return (
			<div className='rounded-[20px] border border-white/10 bg-[#0c0c0f] p-4'>
				<div className='mb-4 flex items-center gap-3'>
					<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white'>
						<FolderKanban className='h-4 w-4' />
					</div>
					<div className='text-sm font-medium text-white'>
						Products Launch
					</div>
				</div>

				<div className='overflow-hidden rounded-xl border border-white/10'>
					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr] border-b border-white/10 bg-white/[0.03] text-xs text-white/55'>
						<div className='border-r border-white/10 px-3 py-2'>
							Task Name
						</div>
						<div className='border-r border-white/10 px-3 py-2'>
							Stage
						</div>
						<div className='px-3 py-2'>Impact</div>
					</div>

					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr] border-b border-white/10 text-xs'>
						<div className='border-r border-white/10 px-3 py-2 text-white/75'>
							▾ Project Kickoff & Planning
						</div>
						<div className='border-r border-white/10 px-3 py-2 text-white/40'></div>
						<div className='px-3 py-2 text-white/40'></div>
					</div>

					{[
						[
							"Define project objectives and goals.",
							"Completed",
							"High",
						],
						[
							"Identify target audience and user persona.",
							"In Review",
							"Low",
						],
						["Schedule kickoff with team", "Completed", "High"],
					].map((row) => (
						<div
							key={row[0]}
							className='grid grid-cols-[1.8fr_0.7fr_0.7fr] border-b border-white/10 text-xs'
						>
							<div className='border-r border-white/10 px-3 py-2 text-white/70'>
								○ {row[0]}
							</div>
							<div className='border-r border-white/10 px-3 py-2'>
								<span className='rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-400'>
									{row[1]}
								</span>
							</div>
							<div className='px-3 py-2'>
								<span className='rounded-full bg-rose-500/15 px-2 py-1 text-[10px] text-rose-400'>
									{row[2]}
								</span>
							</div>
						</div>
					))}

					<div className='px-3 py-2 text-xs text-white/45'>
						+ Add task
					</div>
				</div>
			</div>
		);
	}

	if (variant === "autoflow") {
		return (
			<div className='grid gap-4 md:grid-cols-[0.9fr_1.1fr]'>
				<div className='rounded-[20px] border border-indigo-500/40 bg-[#0c0c0f] p-4 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'>
					<div className='text-sm font-medium text-white'>
						How are tasks being added to this project?
					</div>

					<div className='mt-4 space-y-3'>
						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70'>
							Monthly
						</div>

						<div className='text-xs text-white/45'>Forms</div>

						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70'>
							Cross-functional project plan
						</div>

						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70'>
							Tasks source
						</div>

						<div className='pt-3 text-right'>
							<span className='inline-block rounded-md bg-indigo-500 px-4 py-2 text-xs font-medium text-white'>
								Next
							</span>
						</div>
					</div>
				</div>

				<div className='rounded-[20px] border border-white/10 bg-[#0c0c0f] p-4'>
					<div className='mb-3 flex items-center justify-between'>
						<div>
							<div className='text-xs text-white/45'>Section</div>
							<div className='text-sm font-medium text-white'>
								To do
							</div>
						</div>
						<div className='rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/50'>
							2 incomplete tasks
						</div>
					</div>

					<div className='space-y-3'>
						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/55'>
							When tasks are moved to this section automatically
						</div>
						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/70'>
							Set assignee
						</div>
						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/70'>
							Add collaborators
						</div>
						<div className='rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/70'>
							Action or additional process
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-[20px] border border-white/10 bg-[#0c0c0f] p-4'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white'>
						<FolderKanban className='h-4 w-4' />
					</div>
					<div className='text-sm font-medium text-white'>
						Sales Kickoff Event
					</div>
				</div>

				<div className='rounded-md bg-indigo-500 px-3 py-2 text-xs font-medium text-white'>
					Share
				</div>
			</div>

			<div className='mb-4 flex flex-wrap items-center gap-4 border-b border-white/10 pb-3 text-xs text-white/55'>
				<span className='text-white'>Overview</span>
				<span>List</span>
				<span>Kanban</span>
				<span>Timeline</span>
				<span>Calendar</span>
				<span>Gantt</span>
			</div>

			<div className='space-y-5'>
				<div>
					<div className='mb-2 text-xs text-white/50'>
						Project Description
					</div>
					<div className='space-y-2'>
						<div className='h-2 rounded-full bg-white/[0.06]' />
						<div className='h-2 rounded-full bg-white/[0.06]' />
						<div className='h-2 w-4/5 rounded-full bg-white/[0.06]' />
					</div>
				</div>

				<div>
					<div className='mb-2 text-xs text-white/50'>
						Project Risks
					</div>
					<div className='space-y-2'>
						<div className='h-2 rounded-full bg-white/[0.06]' />
						<div className='h-2 w-3/4 rounded-full bg-white/[0.06]' />
					</div>
				</div>

				<div className='flex items-center gap-6 pt-2'>
					{["Ribbi Dennis", "Jon Fisher", "Rayhan Berman"].map(
						(name) => (
							<div key={name} className='flex items-center gap-2'>
								<div className='h-7 w-7 rounded-full bg-white/20' />
								<div className='text-[11px] leading-4 text-white/70'>
									{name}
								</div>
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
}

function WorkManagementMockup() {
	return (
		<div className='rounded-[24px] border border-white/10 bg-[#17181c] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]'>
			<div className='rounded-[18px] border border-white/10 bg-[#0d0d10] p-4'>
				<div className='mb-4 flex items-center justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white'>
							<FolderKanban className='h-4 w-4' />
						</div>

						<div>
							<p className='text-[11px] text-white/45'>
								Taskmanly Solutions
							</p>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='rounded-md border border-white/10 px-3 py-1.5 text-[11px] text-white/70'>
							June 2024
						</div>
						<div className='rounded-md border border-white/10 px-3 py-1.5 text-[11px] text-white/70'>
							Customize
						</div>
					</div>
				</div>

				<div className='mb-4 flex flex-wrap items-center gap-4 border-b border-white/10 pb-3 text-[11px] text-white/50'>
					<span className='rounded-md bg-white/[0.06] px-2 py-1 text-white'>
						List
					</span>
					<span>Kanban</span>
					<span>Timeline</span>
					<span>Calendar</span>
					<span>Gantt</span>

					<div className='ml-auto rounded-md border border-white/10 px-3 py-1 text-[11px] text-white/60'>
						manage
					</div>
				</div>

				<div className='overflow-hidden rounded-xl border border-white/10'>
					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 bg-white/[0.03] text-[11px] text-white/45'>
						<div className='border-r border-white/10 px-3 py-2'>
							Task
						</div>
						<div className='border-r border-white/10 px-3 py-2'>
							Assignee
						</div>
						<div className='border-r border-white/10 px-3 py-2'>
							Progress
						</div>
						<div className='px-3 py-2'>Deadline</div>
					</div>

					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 text-[11px]'>
						<div className='border-r border-white/10 px-3 py-2 text-white/80'>
							Objective 1: Name of Objective
						</div>
						<div className='border-r border-white/10 px-3 py-2'></div>
						<div className='border-r border-white/10 px-3 py-2'></div>
						<div className='px-3 py-2'></div>
					</div>

					{[
						"Adjust timeline to publish initial release without delay.",
						"Review budget control to ensure the team stays aligned.",
						"Support workflow coordination with managers and engineers.",
						"Reduce approval time across key recurring requests.",
						"Automate repetitive work to improve reporting speed.",
						"Align documentation system with campaign launch dates.",
					].map((task, index) => (
						<div
							key={task}
							className='grid grid-cols-[1.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 text-[11px]'
						>
							<div className='border-r border-white/10 px-3 py-2 text-white/65'>
								○ {task}
							</div>

							<div className='border-r border-white/10 px-3 py-2'>
								<div className='flex items-center gap-1'>
									<div className='h-5 w-5 rounded-full bg-white/20' />
									<div className='h-5 w-5 rounded-full bg-white/10' />
								</div>
							</div>

							<div className='border-r border-white/10 px-3 py-2'>
								<span className='rounded-full bg-rose-500/15 px-2 py-1 text-[10px] text-rose-400'>
									{index % 2 === 0 ? "Key task" : "In review"}
								</span>
							</div>

							<div className='px-3 py-2 text-white/55'>
								Jun {20 + index}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function HomePage() {
	return (
		<main className='min-h-screen bg-black text-white'>
			<section className='relative overflow-hidden'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_45%)]' />

				<div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35' />

				<div className='absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[100px]' />

				<div className='relative mx-auto max-w-7xl px-6 pb-0 pt-6 lg:px-8'>
					<header className='mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md'>
						<Link href='#' className='flex items-center gap-2'>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10'>
								<LayoutGrid className='h-4 w-4 text-white' />
							</div>
							<span className='text-sm font-semibold tracking-wide'>
								Taskmanly
							</span>
						</Link>

						<nav className='hidden items-center gap-7 lg:flex'>
							{navItems.map((item) => (
								<Link
									key={item.label}
									href={item.href}
									className='flex items-center gap-1 text-sm text-white/70 transition hover:text-white'
								>
									<span>{item.label}</span>
									{item.label !== "Pricing" && (
										<ChevronDown className='h-4 w-4' />
									)}
								</Link>
							))}
						</nav>

						<div className='flex items-center gap-3'>
							<Link
								href='#'
								className='hidden text-sm text-white/70 transition hover:text-white md:inline-block'
							>
								Contact Sales
							</Link>

							<Button
								variant='outline'
								className='border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white'
							>
								Log In
							</Button>

							<Button className='bg-indigo-500 text-white hover:bg-indigo-400'>
								Get Started
							</Button>
						</div>
					</header>

					<div className='mx-auto flex max-w-5xl flex-col items-center pt-20 text-center'>
						<div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-sm'>
							<Rocket className='h-3.5 w-3.5 text-indigo-400' />
							Smarter project execution for modern teams
						</div>

						<h1 className='max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
							The Optimal Solution for Collaborative Tasks Across
							Diverse Functions.
						</h1>

						<p className='mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base'>
							Welcome to a smarter way of managing tasks and
							products. Our comprehensive suite is designed to
							streamline your workflow, enhance collaboration, and
							ensure seamless project success.
						</p>

						<div className='mt-8 flex flex-col items-center gap-3 sm:flex-row'>
							<Button
								size='lg'
								className='min-w-[150px] bg-indigo-500 text-white hover:bg-indigo-400'
							>
								Get Started
							</Button>
							<Button
								size='lg'
								variant='outline'
								className='min-w-[150px] border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white'
							>
								Try for Free
							</Button>
						</div>
					</div>

					<div className='mx-auto mt-14 max-w-6xl'>
						<div className='overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur'>
							<div className='flex items-center gap-2 border-b border-white/10 px-5 py-4'>
								<div className='h-3 w-3 rounded-full bg-red-400/80' />
								<div className='h-3 w-3 rounded-full bg-yellow-400/80' />
								<div className='h-3 w-3 rounded-full bg-green-400/80' />
								<div className='ml-4 h-8 flex-1 rounded-full border border-white/10 bg-black/40' />
							</div>

							<div className='relative aspect-[16/9] w-full bg-[#0f0f12]'></div>
						</div>
					</div>

					<div className='mx-auto mt-14 max-w-6xl text-center'>
						<p className='text-xl font-semibold text-white sm:text-2xl'>
							Trusted by over 40,000 teams and companies worldwide
						</p>

						<div className='mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-12 lg:gap-x-14'>
							{brandItems.map((brand) => (
								<div
									key={brand.name}
									className='flex items-center gap-2 text-base font-semibold text-white/80 sm:text-lg'
								>
									<span className='text-white'>
										{brand.icon}
									</span>
									<span>{brand.name}</span>
								</div>
							))}
						</div>
					</div>

					<div className='mx-auto mt-24 max-w-6xl'>
						<div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start'>
							<div>
								<h2 className='max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
									Discover How Various Departments Use
									Taskmanly.
								</h2>
							</div>

							<div>
								<p className='max-w-xl text-sm leading-7 text-white/60 sm:text-base'>
									Discover how different departments utilize
									our platform to streamline workflows,
									improve collaboration, and increase
									productivity. Explore real-world examples
									demonstrating its transformative effects on
									task management.
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
															Define project goals
															and target scope.
														</div>
														<div className='flex items-center gap-2'>
															<span className='h-2 w-2 rounded-full bg-white/60' />
															Identify target
															audience and user
															pain points.
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
															Conduct user
															research and
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
										Fully around defined objectives,
										maximize resource effectiveness, and
										confidently expand the workflow of any
										campaign.
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

					<div className='mx-auto mt-24 max-w-6xl'>
						<div className='text-center'>
							<h2 className='text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
								Focus on Tasks that Generate Revenue.
							</h2>

							<p className='mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base'>
								Taskmanly plays a pivotal role in facilitating
								the coordination of complex tasks among
								different teams, ensuring a seamless
								collaboration that ultimately contributes to the
								achievement of tangible and impactful business
								results.
							</p>
						</div>

						<div className='mt-10 grid gap-6 md:grid-cols-2'>
							{productivityCards.map((card) => (
								<div
									key={card.title}
									className='overflow-hidden rounded-[22px] border border-white/15 bg-[#111214]'
								>
									<div className='border-b border-white/10 px-6 py-6'>
										<h3 className='text-xl font-semibold text-white'>
											{card.title}
										</h3>
										<p className='mt-3 text-sm leading-7 text-white/60'>
											{card.description}
										</p>

										<button
											type='button'
											className='mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white'
										>
											Learn more
											<span>›</span>
										</button>
									</div>

									<div className='bg-[#18191c] p-5'>
										<ProductivityMockup
											variant={card.variant}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className='mx-auto mt-24 max-w-6xl'>
						<div className='grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
							<div>
								<h2 className='max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
									Versatile Work Management for Complex Tasks
								</h2>

								<p className='mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base'>
									Seamlessly switch between views to enhance
									collaboration, increase clarity, and conquer
									complexity. With ViewFlow, managing
									intricate tasks has never been more
									adaptable or straightforward.
								</p>

								<div className='mt-10 space-y-5'>
									{workManagementViews.map((view) => (
										<div
											key={view.title}
											className='border-b border-white/10 pb-4'
										>
											<div className='flex items-center justify-between'>
												<h3
													className={`text-base font-medium ${
														view.active
															? "text-white"
															: "text-white/85"
													}`}
												>
													{view.title}
												</h3>

												<span className='text-white/60'>
													{view.active ? "⌃" : "⌄"}
												</span>
											</div>

											{view.active && (
												<>
													<div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
														<div className='h-full w-2/5 rounded-full bg-indigo-500' />
													</div>

													<p className='mt-4 max-w-lg text-sm leading-7 text-white/60'>
														{view.description}
													</p>
												</>
											)}
										</div>
									))}
								</div>
							</div>

							<div>
								<WorkManagementMockup />
							</div>
						</div>
					</div>

					<div className='mx-auto mt-24 max-w-6xl overflow-hidden'>
						<div className='grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start'>
							<div>
								<h2 className='max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
									Connect Your Tools to Taskmanly
								</h2>
							</div>

							<div>
								<p className='max-w-xl text-sm leading-7 text-white/60 sm:text-base'>
									We have more than 200+ integrations, so you
									can use your favorite work tools to
									communicate, collaborate, and coordinate
									work in one place, from start to finish.
								</p>

								<Button
									variant='outline'
									className='mt-6 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white'
								>
									Learn More
								</Button>
							</div>
						</div>

						<div className='integration-marquee mt-10'>
							<div className='integration-track'>
								{[...integrationTools, ...integrationTools].map(
									(tool, index) => (
										<div
											key={`${tool.name}-${index}`}
											className='w-[280px] shrink-0 rounded-[20px] border border-white/15 bg-[#0d0d10] p-6'
										>
											<div className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white'>
												<FontAwesomeIcon
													icon={tool.icon}
													className={`text-xl ${tool.iconClassName ?? ""}`}
												/>
											</div>

											<h3 className='mt-5 text-xl font-semibold text-white'>
												{tool.name}
											</h3>

											<p className='mt-4 text-sm leading-7 text-white/55'>
												{tool.description}
											</p>

											<button
												type='button'
												className='mt-6 text-sm font-medium text-white transition hover:text-indigo-300'
											>
												See More
											</button>
										</div>
									),
								)}
							</div>
						</div>
					</div>

					<div className='mx-auto mt-12 max-w-6xl overflow-hidden rounded-t-[28px] rounded-b-none border border-white/10 border-b-0 bg-[#0a0a0c]'>
						<div className='relative overflow-hidden border-b border-white/10 px-6 py-14 lg:px-10'>
							<div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_35%,transparent_35%,transparent_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.01)_70%,transparent_70%)] bg-[length:260px_260px] opacity-35' />

							<div className='relative mx-auto max-w-3xl text-center'>
								<h2 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
									Elevate Your Workflow Today!
								</h2>

								<p className='mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base'>
									Take the next step towards seamless task
									management with our cutting-edge software.
									Choose the perfect plan for your needs, and
									empower your team to achieve more.
								</p>

								<div className='mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row'>
									<div className='flex flex-1 items-center gap-3 rounded-xl border border-indigo-500/50 bg-black px-4 py-3 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'>
										<span className='text-white/70'>✉</span>
										<input
											type='text'
											defaultValue='rubik@taskmanly'
											className='w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35'
										/>
									</div>

									<Button className='h-auto rounded-xl bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400'>
										Try for Free
									</Button>
								</div>
							</div>
						</div>

						<footer className='px-6 py-10 lg:px-10'>
							<div className='grid gap-10 lg:grid-cols-[1.15fr_1fr_1fr_1fr_1fr]'>
								<div>
									<div className='flex items-center gap-3'>
										<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white'>
											<LayoutGrid className='h-5 w-5' />
										</div>
										<span className='text-2xl font-semibold text-white'>
											Taskmanly
										</span>
									</div>

									<p className='mt-5 max-w-[220px] text-sm leading-7 text-white/55'>
										Welcome to a smarter way of managing
										tasks and products.
									</p>

									<div className='mt-5 flex flex-col gap-3'>
										<Image
											src='/assets/images/Download_on_the_App_Store_Badge.svg.webp'
											alt='Download on the App Store'
											width={125}
											height={38}
											className='h-auto w-[125px]'
										/>
										<Image
											src='/assets/images/Google_Play_Store_badge_EN.svg.webp'
											alt='Get it on Google Play'
											width={125}
											height={38}
											className='h-auto w-[125px]'
										/>
									</div>
								</div>

								{footerColumns.map((column) => (
									<div key={column.title}>
										<h3 className='text-sm font-semibold text-white'>
											{column.title}
										</h3>

										<div className='mt-4 space-y-2.5'>
											{column.links.map((link) => (
												<Link
													key={link}
													href='#'
													className='block text-sm text-white/55 transition hover:text-white'
												>
													{link}
												</Link>
											))}
										</div>
									</div>
								))}
							</div>

							<div className='mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between'>
								<div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45'>
									<span>
										© 2024 Taskmanly. All right reserved.
									</span>
									<Link
										href='#'
										className='transition hover:text-white'
									>
										Privacy Policy
									</Link>
									<Link
										href='#'
										className='transition hover:text-white'
									>
										Terms of Service
									</Link>
									<Link
										href='#'
										className='transition hover:text-white'
									>
										Manage Cookies
									</Link>
								</div>
							</div>
						</footer>
					</div>
				</div>
			</section>
		</main>
	);
}
