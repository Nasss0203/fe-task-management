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
import type { AdminAuditLog } from "../shared/audit-log-admin.types";
import {
	formatDate,
	getActionLabel,
	getSeverityClass,
	getSeverityLabel,
	getTargetLabel,
	prettyJson,
} from "../shared/audit-log-admin.utils";

type Props = {
	log: AdminAuditLog | null;
	onClose: () => void;
};

export function AuditLogDetailPanel({ log, onClose }: Props) {
	const [open, setOpen] = useState(Boolean(log));
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

	if (!log) return null;

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								Chi tiết audit log
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Xem actor, target, metadata và before / after
								thay đổi dữ liệu.
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

				<div className='no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 py-4'>
					<div className='space-y-4'>
						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thông tin chính
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-neutral-500'>Actor</p>
									<p className='text-white'>
										{log.actorName}
									</p>
									<p className='text-xs text-neutral-500'>
										{log.actorEmail}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>Action</p>
									<p className='text-white'>
										{getActionLabel(log.action)}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>Target</p>
									<p className='text-white'>
										{log.targetName}
									</p>
									<p className='text-xs text-neutral-500'>
										{getTargetLabel(log.targetType)}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>Mô tả</p>
									<p className='mt-1 leading-7 text-white'>
										{log.description}
									</p>
								</div>

								<div className='flex flex-wrap gap-2 pt-1'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSeverityClass(
											log.severity,
										)}`}
									>
										{getSeverityLabel(log.severity)}
									</span>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div>
										<p className='text-neutral-500'>
											Thời gian
										</p>
										<p className='text-white'>
											{formatDate(log.createdAt)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>IP</p>
										<p className='text-white'>
											{log.ipAddress}
										</p>
									</div>
								</div>

								<div>
									<p className='text-neutral-500'>
										User agent
									</p>
									<p className='text-white'>
										{log.userAgent}
									</p>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Before
							</h3>

							<pre className='max-h-65 overflow-auto rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 text-xs leading-6 text-neutral-300'>
								{prettyJson(log.before)}
							</pre>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								After
							</h3>

							<pre className='max-h-65 overflow-auto rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 text-xs leading-6 text-neutral-300'>
								{prettyJson(log.after)}
							</pre>
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
