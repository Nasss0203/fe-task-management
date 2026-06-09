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
		iconClassName: "text-emerald-500 dark:text-emerald-400",
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
					<h2 className='text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl'>
						Connect your tools.
					</h2>
					<p className='mt-6 text-lg text-muted-foreground'>
						We have more than 200+ integrations, so you can use your
						favorite tools to communicate and coordinate.
					</p>
				</div>

				<div className='flex justify-start lg:justify-end'>
					<Button
						variant='outline'
						className='h-12 rounded-full border-border bg-secondary px-8 font-semibold text-foreground transition-all hover:bg-secondary/80 active:scale-[0.98]'
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
								className='group w-72 shrink-0 rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary/30 hover:shadow-md'
							>
								<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
									<FontAwesomeIcon
										icon={tool.icon}
										className={`text-xl ${tool.iconClassName ?? ""}`}
									/>
								</div>

								<h3 className='mt-6 text-xl font-semibold text-foreground'>
									{tool.name}
								</h3>

								<p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
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
