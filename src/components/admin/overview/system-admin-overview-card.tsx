import { Lock, ShieldCheck } from "lucide-react";

type Props = {
	total: number;
	locked: number;
};

export function SystemAdminOverviewCard({ total, locked }: Props) {
	const cards = [
		{
			title: "Quản trị viên hệ thống",
			value: total,
			helper: "Có quyền vận hành admin",
			icon: ShieldCheck,
			iconClass: "border-[#BFDBFE] bg-[#EFF6FF] text-[#3B82F6]",
		},
		{
			title: "Admin bị khóa",
			value: locked,
			helper: "Tài khoản admin đang bị khóa",
			icon: Lock,
			iconClass: "border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]",
		},
	];

	return (
		<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div
						key={card.title}
						className='rounded-2xl border border-border bg-white p-5 shadow-sm'
					>
						<div className='flex items-start justify-between gap-4'>
							<div className='space-y-2'>
								<p className='text-sm text-[#64748B]'>
									{card.title}
								</p>
								<h3 className='text-3xl font-semibold text-[#0F172A]'>
									{card.value}
								</h3>
								<p className='text-xs text-[#64748B]'>
									{card.helper}
								</p>
							</div>

							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconClass}`}
							>
								<Icon className='h-5 w-5' />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
