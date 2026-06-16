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
import { Button } from "@/components/ui/button";

const integrationTools: {
	name: string;
	description: string;
	icon: IconDefinition;
	iconClassName?: string;
}[] = [
	{
		name: "Google Calendar",
		description: "Lên lịch và quản lý các sự kiện liên quan đến dự án.",
		icon: faCalendarIcon,
	},
	{
		name: "Github",
		description: "Theo dõi thay đổi mã nguồn và quản lý lỗi dễ dàng.",
		icon: faGithub,
	},
	{
		name: "Google Sheet",
		description: "Giữ dữ liệu dự án của bạn luôn cập nhật với các báo cáo.",
		icon: faTableCellsLarge,
		iconClassName: "text-emerald-500 dark:text-emerald-400",
	},
	{
		name: "Slack",
		description: "Nhận thông báo cập nhật dự án và cộng tác nhóm.",
		icon: faSlack,
	},
	{
		name: "Dropbox",
		description: "Lưu trữ mọi tài liệu tại một không gian tập trung.",
		icon: faDropbox,
	},
	{
		name: "Google Workspace",
		description: "Kết hợp các công cụ Google của bạn để tập trung công việc.",
		icon: faGoogle,
	},
];

const Integrations = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200'>
			<div className='grid gap-12 lg:grid-cols-2 lg:items-end'>
				<div>
					<h2 className='text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl'>
						Kết nối các công cụ của bạn.
					</h2>
					<p className='mt-6 text-lg text-muted-foreground'>
						Chúng tôi có hơn 200 tiện ích tích hợp, giúp bạn thoải mái sử dụng
						các công cụ yêu thích để giao tiếp và phối hợp.
					</p>
				</div>

				<div className='flex justify-start lg:justify-end'>
					<Button
						variant='outline'
						className='h-12 rounded-full border-border bg-secondary px-8 font-semibold text-foreground transition-all hover:bg-secondary/80 active:scale-[0.98]'
					>
						Khám phá các Tiện ích Tích hợp
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
