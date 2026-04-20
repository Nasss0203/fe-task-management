import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock3, Ellipsis, Eye, ShieldCheck, ShieldX } from "lucide-react";
import type { MonitoringEvent } from "../shared/monitoring-admin.types";
import {
	formatDate,
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
	onAcknowledge: (eventId: string) => void;
	onResolve: (eventId: string) => void;
};

export function MonitoringEventManagementTable({
	events,
	onView,
	onAcknowledge,
	onResolve,
}: Props) {
	if (!events.length) {
		return (
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có event phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						System events
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Log lỗi request, queue failed, email failed, webhook
						failed và các cảnh báo hệ thống gần đây.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{events.length} events
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1400px] border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>Event</th>
							<th className='px-4 py-2 font-medium'>Service</th>
							<th className='px-4 py-2 font-medium'>Type</th>
							<th className='px-4 py-2 font-medium'>Severity</th>
							<th className='px-4 py-2 font-medium'>Status</th>
							<th className='px-4 py-2 font-medium'>Time</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{events.map((event) => (
							<tr
								key={event.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{event.title}
										</p>
										<p className='max-w-[360px] truncate text-xs text-neutral-500'>
											{event.description}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{event.serviceName}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEventTypeClass(
											event.type,
										)}`}
									>
										{getEventTypeLabel(event.type)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSeverityClass(
											event.severity,
										)}`}
									>
										{getSeverityLabel(event.severity)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEventStatusClass(
											event.status,
										)}`}
									>
										{getEventStatusLabel(event.status)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<div className='inline-flex items-center gap-2 text-neutral-300'>
											<Clock3 className='h-4 w-4 text-neutral-500' />
											<span>
												{formatRelativeTime(
													event.createdAt,
												)}
											</span>
										</div>
										<p className='text-xs text-neutral-500'>
											{formatDate(event.createdAt)}
										</p>
									</div>
								</td>

								<td className='rounded-r-3xl border-y border-r border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex justify-end'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
													<Ellipsis className='h-4 w-4' />
												</button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align='end'
												className='w-56 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() =>
														onView(event)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>

												{event.status === "OPEN" && (
													<DropdownMenuItem
														onClick={() =>
															onAcknowledge(
																event.id,
															)
														}
														className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
													>
														<ShieldCheck className='mr-2 h-4 w-4' />
														Ghi nhận sự cố
													</DropdownMenuItem>
												)}

												{event.status !==
													"RESOLVED" && (
													<>
														<DropdownMenuSeparator className='my-1 bg-white/10' />
														<DropdownMenuItem
															onClick={() =>
																onResolve(
																	event.id,
																)
															}
															className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
														>
															<ShieldX className='mr-2 h-4 w-4' />
															Đánh dấu đã xử lý
														</DropdownMenuItem>
													</>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
