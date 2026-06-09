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
		description: "Schedule and manage your project-related events.",
		icon: faCalendarIcon,
	},
	{
		name: "Github",
		description: "Track code changes and manage issues effortlessly.",
		icon: faGithub,
	},
	{
		name: "Google Sheet",
		description: "Keep your project data up-to-date with reports.",
		icon: faTableCellsLarge,
		iconClassName: "text-emerald-400",
	},
	{
		name: "Slack",
		description: "Receive project updates and collaborate as a team.",
		icon: faSlack,
	},
	{
		name: "Dropbox",
		description: "Keep all documents in one central location.",
		icon: faDropbox,
	},
	{
		name: "Google Workspace",
		description: "Bring your Google tools together to centralize work.",
		icon: faGoogle,
	},
];

const Integrations = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200'>
			<div className='grid gap-12 lg:grid-cols-2 lg:items-end'>
				<div>
					<h2 className='text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl'>
						Connect your tools.
					</h2>
					<p className='mt-6 text-lg text-white/50'>
						We have more than 200+ integrations, so you can use your
						favorite tools to communicate and coordinate.
					</p>
				</div>

				<div className='flex justify-start lg:justify-end'>
					<Button
						variant='outline'
						className='h-12 rounded-full border-white/10 bg-white/5 px-8 font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]'
					>
						Explore Integrations
					</Button>
				</div>
			</div>

			<div className='integration-marquee mt-16'>
				<div className='integration-track'>
					{[...integrationTools, ...integrationTools].map(
						(tool, index) => (
							<div
								key={`${tool.name}-${index}`}
								className='group w-72 shrink-0 rounded-3xl border border-white/5 bg-[#111214] p-8 transition-all hover:border-indigo-500/30'
							>
								<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-400'>
									<FontAwesomeIcon
										icon={tool.icon}
										className={`text-xl ${tool.iconClassName ?? ""}`}
									/>
								</div>

								<h3 className='mt-6 text-xl font-semibold text-white'>
									{tool.name}
								</h3>

								<p className='mt-3 text-sm leading-relaxed text-white/40'>
									{tool.description}
								</p>
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
};

export default Integrations;
