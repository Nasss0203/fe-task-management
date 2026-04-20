import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock3, Ellipsis, Eye, LogIn, Mail } from "lucide-react";
import type { SupportTicket } from "../shared/support-admin.types";
import {
	formatRelativeTime,
	getSupportIssueTypeClass,
	getSupportIssueTypeLabel,
	getSupportPriorityClass,
	getSupportPriorityLabel,
	getSupportStatusClass,
	getSupportStatusLabel,
} from "../shared/support-admin.utils";

type Props = {
	tickets: SupportTicket[];
	onView: (ticket: SupportTicket) => void;
	onSendEmail: (ticketId: string) => void;
	onImpersonate: (ticketId: string) => void;
};

export function SupportTicketManagementTable({
	tickets,
	onView,
	onSendEmail,
	onImpersonate,
}: Props) {
	if (!tickets.length) {
		return (
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có ticket phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Support queue
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Quản lý ticket hỗ trợ, bug report và các case lỗi vận
						hành liên quan tới workspace.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{tickets.length} tickets
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1480px] border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>Ticket</th>
							<th className='px-4 py-2 font-medium'>Người gửi</th>
							<th className='px-4 py-2 font-medium'>Workspace</th>
							<th className='px-4 py-2 font-medium'>Loại</th>
							<th className='px-4 py-2 font-medium'>Priority</th>
							<th className='px-4 py-2 font-medium'>Status</th>
							<th className='px-4 py-2 font-medium'>Assignee</th>
							<th className='px-4 py-2 font-medium'>Updated</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{tickets.map((ticket) => (
							<tr
								key={ticket.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{ticket.title}
										</p>
										<p className='text-xs text-neutral-500'>
											{ticket.ticketNo}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{ticket.reporterName}
										</p>
										<p className='text-xs text-neutral-500'>
											{ticket.reporterEmail}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{ticket.workspaceName}
										</p>
										<p className='text-xs text-neutral-500'>
											{ticket.workspaceId}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSupportIssueTypeClass(
											ticket.issueType,
										)}`}
									>
										{getSupportIssueTypeLabel(
											ticket.issueType,
										)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSupportPriorityClass(
											ticket.priority,
										)}`}
									>
										{getSupportPriorityLabel(
											ticket.priority,
										)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSupportStatusClass(
											ticket.status,
										)}`}
									>
										{getSupportStatusLabel(ticket.status)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{ticket.assigneeName ?? "Chưa assign"}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='inline-flex items-center gap-2 text-neutral-300'>
										<Clock3 className='h-4 w-4 text-neutral-500' />
										<span>
											{formatRelativeTime(
												ticket.updatedAt,
											)}
										</span>
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
												className='w-60 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() =>
														onView(ticket)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														onSendEmail(ticket.id)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Mail className='mr-2 h-4 w-4' />
													Gửi email hỗ trợ
												</DropdownMenuItem>

												{ticket.canImpersonate && (
													<>
														<DropdownMenuSeparator className='my-1 bg-white/10' />
														<DropdownMenuItem
															onClick={() =>
																onImpersonate(
																	ticket.id,
																)
															}
															className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
														>
															<LogIn className='mr-2 h-4 w-4' />
															Giả lập vào
															workspace
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
