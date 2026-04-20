"use client";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useRef, useState } from "react";
import type { AdminUser } from "../shared/users.types";
import {
	formatDate,
	getStatusClass,
	getSystemRoleClass,
} from "../shared/users.utils";

type Props = {
	user: AdminUser | null;
	onClose: () => void;
};

export function UserDetailPanel({ user, onClose }: Props) {
	const [open, setOpen] = useState(Boolean(user));
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current);
			}
		};
	}, []);

	const handleRequestClose = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
		}

		setOpen(false);

		closeTimerRef.current = setTimeout(() => {
			onClose();
		}, 300);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			handleRequestClose();
			return;
		}

		setOpen(true);
	};

	if (!user) return null;

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								User Details
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Basic info, workspaces, roles, and activity
								history.
							</DrawerDescription>
						</div>

						<Button
							type='button'
							variant='ghost'
							onClick={handleRequestClose}
							className='h-9 rounded-xl border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white'
						>
							Close
						</Button>
					</div>
				</DrawerHeader>

				<div className='no-scrollbar flex-1 overflow-y-auto px-6 py-4'>
					<div className='space-y-4'>
						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Basic Information
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-neutral-500'>
										Full name
									</p>
									<p className='text-white'>
										{user.fullName}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>Email</p>
									<p className='text-white'>{user.email}</p>
								</div>

								<div className='flex flex-wrap gap-2 pt-1'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
											user.status,
										)}`}
									>
										{user.status}
									</span>

									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSystemRoleClass(
											user.systemRole,
										)}`}
									>
										{user.systemRole}
									</span>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div>
										<p className='text-neutral-500'>
											Created at
										</p>
										<p className='text-white'>
											{formatDate(user.createdAt)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Last active
										</p>
										<p className='text-white'>
											{formatDate(user.lastActive)}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Workspaces
							</h3>

							<div className='space-y-3'>
								{user.workspaces.map((workspace) => (
									<div
										key={workspace.id}
										className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
									>
										<div className='flex items-center justify-between gap-4'>
											<p className='text-sm font-medium text-white'>
												{workspace.name}
											</p>

											<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
												{workspace.role}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Activity History
							</h3>

							<div className='space-y-4'>
								{user.activities.map((activity, index) => (
									<div
										key={activity.id}
										className='flex gap-3'
									>
										<div className='flex flex-col items-center'>
											<div className='mt-1 h-2.5 w-2.5 rounded-full bg-white' />
											{index !==
												user.activities.length - 1 && (
												<div className='mt-2 h-full w-px bg-white/10' />
											)}
										</div>

										<div className='pb-2'>
											<p className='text-sm font-medium text-white'>
												{activity.action}
											</p>
											<p className='mt-1 text-xs text-neutral-500'>
												{formatDate(activity.time)}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<DrawerFooter className='border-t border-white/10 px-6 py-4'>
					<Button
						variant='outline'
						onClick={handleRequestClose}
						className='h-11 rounded-2xl border-white/10 bg-[#111111] text-white hover:bg-white/5 hover:text-white'
					>
						Close
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
