"use client";

import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus } from "lucide-react";

type Props = {
	isSuperAdmin: boolean;
	onCreateSystemAdmin: () => void;
};

export function SystemAdminHeader({
	isSuperAdmin,
	onCreateSystemAdmin,
}: Props) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#475569]'>
					<ShieldCheck className='h-4 w-4 text-[#2563EB]' />
					Admin console
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl'>
					System Admin
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-[#64748B]'>
					Quản lý những người có quyền vận hành hệ thống admin.
				</p>
			</div>

			<div className='flex w-fit shrink-0 items-center gap-2 md:justify-end'>
				{isSuperAdmin ? (
					<Button onClick={onCreateSystemAdmin}>
						<UserPlus data-icon='inline-start' />
						Tạo System Admin
					</Button>
				) : null}

				<div className='inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300'>
					<ShieldCheck className='h-4 w-4' />
					{isSuperAdmin ? "Super Admin" : "System Admin"}
				</div>
			</div>
		</div>
	);
}
