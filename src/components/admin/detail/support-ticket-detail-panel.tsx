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
import { LogIn, Mail, Send } from "lucide-react";
import type {
	SupportTicket,
	SupportTicketPriority,
	SupportTicketStatus,
} from "../shared/support-admin.types";
import {
	formatDate,
	getSupportIssueTypeClass,
	getSupportIssueTypeLabel,
	getSupportPriorityClass,
	getSupportPriorityLabel,
	getSupportSenderClass,
	getSupportSenderLabel,
	getSupportStatusClass,
	getSupportStatusLabel,
} from "../shared/support-admin.utils";

type Props = {
	ticket: SupportTicket | null;
	supportAgents: string[];
	onClose: () => void;
	onUpdateStatus: (ticketId: string, status: SupportTicketStatus) => void;
	onUpdatePriority: (
		ticketId: string,
		priority: SupportTicketPriority,
	) => void;
	onUpdateAssignee: (ticketId: string, assigneeName: string | null) => void;
	onAddReply: (ticketId: string, message: string) => void;
	onSendEmail: (ticketId: string) => void;
	onImpersonate: (ticketId: string) => void;
};

export function SupportTicketDetailPanel({
	ticket,
	supportAgents,
	onClose,
	onUpdateStatus,
	onUpdatePriority,
	onUpdateAssignee,
	onAddReply,
	onSendEmail,
	onImpersonate,
}: Props) {
	const [open, setOpen] = useState(Boolean(ticket));
	const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus>(
		ticket?.status ?? "OPEN",
	);
	const [selectedPriority, setSelectedPriority] =
		useState<SupportTicketPriority>(ticket?.priority ?? "LOW");
	const [selectedAssignee, setSelectedAssignee] = useState(
		ticket?.assigneeName ?? "",
	);
	const [reply, setReply] = useState("");
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

	if (!ticket) return null;

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								Chi tiết support ticket
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Xử lý ticket, gửi email hỗ trợ và theo dõi lịch
								sử trao đổi.
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
								Thông tin ticket
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-xs uppercase tracking-[0.18em] text-neutral-500'>
										{ticket.ticketNo}
									</p>
									<h3 className='mt-2 text-xl font-semibold text-white'>
										{ticket.title}
									</h3>
								</div>

								<div className='flex flex-wrap gap-2 pt-1'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSupportIssueTypeClass(
											ticket.issueType,
										)}`}
									>
										{getSupportIssueTypeLabel(
											ticket.issueType,
										)}
									</span>

									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSupportPriorityClass(
											ticket.priority,
										)}`}
									>
										{getSupportPriorityLabel(
											ticket.priority,
										)}
									</span>

									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSupportStatusClass(
											ticket.status,
										)}`}
									>
										{getSupportStatusLabel(ticket.status)}
									</span>
								</div>

								<div>
									<p className='text-neutral-500'>
										Người gửi
									</p>
									<p className='text-white'>
										{ticket.reporterName}
									</p>
									<p className='text-xs text-neutral-500'>
										{ticket.reporterEmail}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>
										Workspace
									</p>
									<p className='text-white'>
										{ticket.workspaceName}
									</p>
									<p className='text-xs text-neutral-500'>
										{ticket.workspaceId}
									</p>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-1'>
									<div>
										<p className='text-neutral-500'>
											Tạo lúc
										</p>
										<p className='text-white'>
											{formatDate(ticket.createdAt)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Cập nhật
										</p>
										<p className='text-white'>
											{formatDate(ticket.updatedAt)}
										</p>
									</div>
								</div>

								<div>
									<p className='text-neutral-500'>
										Mô tả lỗi
									</p>
									<p className='mt-1 leading-7 text-white'>
										{ticket.summary}
									</p>
								</div>

								{!!ticket.tags.length && (
									<div className='flex flex-wrap gap-2 pt-1'>
										{ticket.tags.map((tag) => (
											<span
												key={tag}
												className='rounded-full border border-white/10 bg-[#0b0b0b] px-2.5 py-1 text-xs text-neutral-300'
											>
												#{tag}
											</span>
										))}
									</div>
								)}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Điều phối xử lý
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Assignee
									</label>
									<select
										value={selectedAssignee}
										onChange={(e) =>
											setSelectedAssignee(e.target.value)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										<option value=''>Chưa assign</option>
										{supportAgents.map((agent) => (
											<option key={agent} value={agent}>
												{agent}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Status
									</label>
									<select
										value={selectedStatus}
										onChange={(e) =>
											setSelectedStatus(
												e.target
													.value as SupportTicketStatus,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										<option value='OPEN'>Mới mở</option>
										<option value='IN_PROGRESS'>
											Đang xử lý
										</option>
										<option value='WAITING_CUSTOMER'>
											Chờ khách hàng
										</option>
										<option value='RESOLVED'>
											Đã xử lý
										</option>
										<option value='CLOSED'>Đã đóng</option>
									</select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Priority
									</label>
									<select
										value={selectedPriority}
										onChange={(e) =>
											setSelectedPriority(
												e.target
													.value as SupportTicketPriority,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										<option value='LOW'>Thấp</option>
										<option value='MEDIUM'>
											Trung bình
										</option>
										<option value='HIGH'>Cao</option>
										<option value='URGENT'>Khẩn cấp</option>
									</select>
								</div>

								<button
									onClick={() => {
										onUpdateAssignee(
											ticket.id,
											selectedAssignee || null,
										);
										onUpdateStatus(
											ticket.id,
											selectedStatus,
										);
										onUpdatePriority(
											ticket.id,
											selectedPriority,
										);
									}}
									className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
								>
									Lưu xử lý
								</button>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Support actions
							</h3>

							<div className='space-y-3'>
								<button
									onClick={() => onSendEmail(ticket.id)}
									className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 text-sm font-medium text-white hover:bg-white/5'
								>
									<Mail className='h-4 w-4' />
									Gửi email hỗ trợ
								</button>

								{ticket.canImpersonate && (
									<button
										onClick={() => onImpersonate(ticket.id)}
										className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 text-sm font-medium text-white hover:bg-white/5'
									>
										<LogIn className='h-4 w-4' />
										Giả lập vào workspace
									</button>
								)}

								<p className='text-xs leading-6 text-neutral-500'>
									Mọi hành động nhạy cảm như impersonate nên
									được ghi lại ở audit log.
								</p>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Attachments
							</h3>

							<div className='space-y-3'>
								{ticket.attachments.length ? (
									ticket.attachments.map((attachment) => (
										<div
											key={attachment.id}
											className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
										>
											<p className='text-sm font-medium text-white'>
												{attachment.fileName}
											</p>
											<p className='text-xs text-neutral-500'>
												{attachment.fileSize}
											</p>
										</div>
									))
								) : (
									<p className='text-sm text-neutral-500'>
										Không có file đính kèm.
									</p>
								)}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Hội thoại hỗ trợ
							</h3>

							<div className='space-y-4'>
								{ticket.conversation.map((item) => (
									<div
										key={item.id}
										className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-4'
									>
										<div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
											<div className='flex items-center gap-2'>
												<p className='text-sm font-medium text-white'>
													{item.senderName}
												</p>
												<span
													className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getSupportSenderClass(
														item.senderType,
													)}`}
												>
													{getSupportSenderLabel(
														item.senderType,
													)}
												</span>
											</div>

											<span className='text-xs text-neutral-500'>
												{formatDate(item.createdAt)}
											</span>
										</div>

										<p className='text-sm leading-7 text-neutral-300'>
											{item.message}
										</p>
									</div>
								))}
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Phản hồi support
							</h3>

							<textarea
								value={reply}
								onChange={(e) => setReply(e.target.value)}
								rows={5}
								placeholder='Nhập nội dung hỗ trợ hoặc ghi chú xử lý...'
								className='w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none placeholder:text-neutral-500'
							/>

							<button
								onClick={() => {
									if (!reply.trim()) return;
									onAddReply(ticket.id, reply.trim());
									setReply("");
								}}
								className='mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
							>
								<Send className='h-4 w-4' />
								Thêm phản hồi
							</button>
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
