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
import { ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MonitoringEvent } from "../shared/monitoring-admin.types";
import {
	formatDate,
	getEventStatusClass,
	getEventStatusLabel,
	getEventTypeClass,
	getEventTypeLabel,
	getSeverityClass,
	getSeverityLabel,
	prettyJson,
} from "../shared/monitoring-admin.utils";

type Props = {
	event: MonitoringEvent | null;
	onClose: () => void;
	onAcknowledge: (eventId: string) => void;
	onResolve: (eventId: string) => void;
};

export function MonitoringEventDetailPanel({
	event,
	onClose,
	onAcknowledge,
	onResolve,
}: Props) {
	const [open, setOpen] = useState(Boolean(event));
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

	if (!event) return null;

	const showAcknowledge = event.status === "OPEN";
	const showResolve = event.status !== "RESOLVED";

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								Chi tiết monitoring event
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Xem service liên quan, metadata lỗi và trạng
								thái xử lý sự cố.
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
								Thông tin sự cố
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-xs uppercase tracking-[0.18em] text-neutral-500'>
										{event.serviceName}
									</p>
									<h3 className='mt-2 text-xl font-semibold text-white'>
										{event.title}
									</h3>
								</div>

								<div className='flex flex-wrap gap-2 pt-1'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getEventTypeClass(
											event.type,
										)}`}
									>
										{getEventTypeLabel(event.type)}
									</span>

									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSeverityClass(
											event.severity,
										)}`}
									>
										{getSeverityLabel(event.severity)}
									</span>

									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getEventStatusClass(
											event.status,
										)}`}
									>
										{getEventStatusLabel(event.status)}
									</span>
								</div>

								<div>
									<p className='text-neutral-500'>Mô tả</p>
									<p className='mt-1 leading-7 text-white'>
										{event.description}
									</p>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div>
										<p className='text-neutral-500'>
											Actor
										</p>
										<p className='text-white'>
											{event.actor}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Thời gian
										</p>
										<p className='text-white'>
											{formatDate(event.createdAt)}
										</p>
									</div>
								</div>

								{event.resolutionNote && (
									<div>
										<p className='text-neutral-500'>
											Ghi chú xử lý
										</p>
										<p className='mt-1 text-white'>
											{event.resolutionNote}
										</p>
									</div>
								)}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Metadata
							</h3>

							<pre className='max-h-80 overflow-auto rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 text-xs leading-6 text-neutral-300'>
								{prettyJson(event.metadata)}
							</pre>
						</div>

						{(showAcknowledge || showResolve) && (
							<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
								<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
									Hành động xử lý
								</h3>

								<div className='space-y-3'>
									{showAcknowledge && (
										<button
											onClick={() =>
												onAcknowledge(event.id)
											}
											className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
										>
											<ShieldCheck className='h-4 w-4' />
											Ghi nhận sự cố
										</button>
									)}

									{showResolve && (
										<button
											onClick={() => onResolve(event.id)}
											className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
										>
											<ShieldX className='h-4 w-4' />
											Đánh dấu đã xử lý
										</button>
									)}
								</div>
							</div>
						)}
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
