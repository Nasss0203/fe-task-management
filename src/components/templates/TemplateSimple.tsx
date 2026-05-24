import { ClipboardList, FolderKanban } from "lucide-react";

const TEMPLATE_NONE = [
	{
		key: "task_tracker" as const,
		title: "Trang trống",
		icon: ClipboardList,
	},
	{
		key: "project" as const,
		title: "Cơ sở dữ liệu trốnng",
		icon: FolderKanban,
	},
];

const TemplateSimple = () => {
	return (
		<div className='grid grid-cols-2 gap-5'>
			{TEMPLATE_NONE.map((item) => {
				const Icon = item.icon;

				return (
					<button
						key={item.key}
						type='button'
						className={`rounded-2xl border p-5 text-left transition cursor-pointer`}
					>
						<div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800'>
							<Icon size={18} />
						</div>

						<div className='mb-1 text-base font-semibold'>
							{item.title}
						</div>
					</button>
				);
			})}
		</div>
	);
};

export default TemplateSimple;
