"use client";

import { CreateSystemAdminDialog } from "@/components/admin/dialog/create-system-admin-dialog";
import { Button } from "@/components/ui/button";
import type { CreateSystemAdminDto } from "@/services/admin/user/type";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";

type UserAdminHeaderProps = {
	isSuperAdmin: boolean;
	isCreatingSystemAdmin: boolean;
	onCreateSystemAdmin: (data: CreateSystemAdminDto) => Promise<void>;
};

export function UserAdminHeader({
	isSuperAdmin,
	isCreatingSystemAdmin,
	onCreateSystemAdmin,
}: UserAdminHeaderProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className='flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#475569]'>
					<ShieldCheck className='h-4 w-4 text-[#2563EB]' />
					Admin console
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl'>
					Quản lý người dùng
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-[#64748B]'>
					Quản lý trạng thái tài khoản, phân quyền system admin và
					theo dõi tăng trưởng, hoạt động của user trên toàn hệ thống.
				</p>
			</div>

			<div className='flex w-fit items-center gap-2'>
				{isSuperAdmin ? (
					<Button onClick={() => setIsDialogOpen(true)}>
						<UserPlus data-icon='inline-start' />
						Tạo System Admin
					</Button>
				) : null}

				<div className='inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300'>
					<ShieldCheck className='h-4 w-4' />
					{isSuperAdmin ? "Super Admin" : "System Admin"}
				</div>
			</div>

			<CreateSystemAdminDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSubmit={onCreateSystemAdmin}
				isPending={isCreatingSystemAdmin}
			/>
		</div>
	);
}
