"use client";

import { BellRing, ChevronDown, ChevronUp } from "lucide-react";
import { useRef } from "react";
import type { MonitoringEvent } from "../shared/monitoring-admin.types";
import {
	formatRelativeTime,
	getEventStatusClass,
	getEventStatusLabel,
	getEventTypeClass,
	getEventTypeLabel,
	getSeverityClass,
	getSeverityLabel,
} from "../shared/monitoring-admin.utils";

type Props = {
	events: MonitoringEvent[];
	onView: (event: MonitoringEvent) => void;
	height?: number;
};

export function MonitoringAlertFeed({ events, onView, height }: Props) {
	const scrollRef = useRef<HTMLDivElement | null>(null);

	const alertItems = events
		.filter(
			(event) =>
				event.status !== "RESOLVED" &&
				(event.severity === "WARNING" || event.severity === "CRITICAL"),
		)
		.slice(0, 8);

	const handleScroll = (direction: "up" | "down") => {
		if (!scrollRef.current) return;

		scrollRef.current.scrollBy({
			top: direction === "up" ? -260 : 260,
			behavior: "smooth",
		});
	};

	return (
		<div
			style={height ? { height: `${height}px` } : undefined}
			className='flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'
		>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Active alerts
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Các cảnh báo đang mở hoặc đã ghi nhận nhưng chưa xử lý
						xong.
					</p>
				</div>

				<div className='flex items-center gap-2'>
					<button
						onClick={() => handleScroll("up")}
						className='inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#101010] text-neutral-300 transition hover:bg-white/5 hover:text-white'
						aria-label='Scroll up alerts'
					>
						<ChevronUp className='h-4 w-4' />
					</button>

					<button
						onClick={() => handleScroll("down")}
						className='inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#101010] text-neutral-300 transition hover:bg-white/5 hover:text-white'
						aria-label='Scroll down alerts'
					>
						<ChevronDown className='h-4 w-4' />
					</button>

					<div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400'>
						<BellRing className='h-5 w-5' />
					</div>
				</div>
			</div>

			<div className='relative min-h-0 flex-1 overflow-hidden'>
				<div className='pointer-events-none absolute inset-x-0 top-0 z-10 h-8 rounded-t-3xl bg-linear-to-b from-[#0b0b0b] to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 rounded-b-3xl bg-linear-to-t from-[#0b0b0b] to-transparent' />

				<div
					ref={scrollRef}
					className='h-full min-h-0 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10'
				>
					{alertItems.map((event) => (
						<button
							key={event.id}
							onClick={() => onView(event)}
							className='w-full rounded-3xl border border-white/10 bg-[#101010] p-4 text-left transition hover:bg-white/5'
						>
							<p className='text-sm font-semibold leading-6 text-white'>
								{event.title}
							</p>

							<div className='mt-3 flex flex-wrap items-center gap-2'>
								<span
									className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getEventTypeClass(
										event.type,
									)}`}
								>
									{getEventTypeLabel(event.type)}
								</span>

								<span
									className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getSeverityClass(
										event.severity,
									)}`}
								>
									{getSeverityLabel(event.severity)}
								</span>

								<span
									className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getEventStatusClass(
										event.status,
									)}`}
								>
									{getEventStatusLabel(event.status)}
								</span>
							</div>

							<p className='mt-3 text-xs text-neutral-500'>
								{event.serviceName}
							</p>

							<div className='mt-3 text-xs text-neutral-500'>
								{formatRelativeTime(event.createdAt)}
							</div>
						</button>
					))}

					{!alertItems.length && (
						<div className='rounded-3xl border border-white/10 bg-[#101010] p-6 text-sm text-neutral-500'>
							Hiện không có alert cần chú ý.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
