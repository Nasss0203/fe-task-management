import {
	faDropbox,
	faGithub,
	faGoogle,
	faSlack,
	IconDefinition,
} from "@fortawesome/free-brands-svg-icons";
import {
	faCalendarDays as faCalendarIcon,
	faTableCellsLarge,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui/button";
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
const Integrations = () => {
	return (
		<div className='mx-auto mt-24 max-w-6xl overflow-hidden'>
			<div className='grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start'>
				<div>
					<h2 className='max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
						Connect Your Tools to Taskmanly
					</h2>
				</div>

				<div>
					<p className='max-w-xl text-sm leading-7 text-white/60 sm:text-base'>
						We have more than 200+ integrations, so you can use your
						favorite work tools to communicate, collaborate, and
						coordinate work in one place, from start to finish.
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
								className='w-70 shrink-0 rounded-5 border border-white/15 bg-[#0d0d10] p-6'
							>
								<div className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-white'>
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
	);
};

export default Integrations;
