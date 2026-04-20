"use client";

import { SupportTicketDetailPanel } from "@/components/admin/detail/support-ticket-detail-panel";
import { SupportFilterBar } from "@/components/admin/filters/support-filter-bar";
import { SupportAdminHeader } from "@/components/admin/header/support-admin-header";
import { SupportOverviewCards } from "@/components/admin/overview/support-overview-cards";
import { adminSupportTickets } from "@/components/admin/shared/support-admin.mock-data";
import type {
	SupportConversationItem,
	SupportTicket,
	SupportTicketPriority,
	SupportTicketStatus,
} from "@/components/admin/shared/support-admin.types";
import { matchesSupportDateFilter } from "@/components/admin/shared/support-admin.utils";
import { SupportTicketManagementTable } from "@/components/admin/table/support-ticket-management-table";
import { useMemo, useState } from "react";

const SUPPORT_AGENTS = ["Bui Hoang Yen", "Kai Sou", "Nass", "Olivia Nguyen"];

export default function AdminSupportPage() {
	const [tickets, setTickets] =
		useState<SupportTicket[]>(adminSupportTickets);
	const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
		null,
	);

	const [search, setSearch] = useState("");
	const [issueType, setIssueType] = useState("all");
	const [status, setStatus] = useState("all");
	const [priority, setPriority] = useState("all");
	const [time, setTime] = useState("all");

	const filteredTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				ticket.ticketNo.toLowerCase().includes(keyword) ||
				ticket.title.toLowerCase().includes(keyword) ||
				ticket.reporterName.toLowerCase().includes(keyword) ||
				ticket.reporterEmail.toLowerCase().includes(keyword) ||
				ticket.workspaceName.toLowerCase().includes(keyword);

			const matchesIssueType =
				issueType === "all" || ticket.issueType === issueType;

			const matchesStatus = status === "all" || ticket.status === status;

			const matchesPriority =
				priority === "all" || ticket.priority === priority;

			const matchesTime = matchesSupportDateFilter(
				ticket.updatedAt,
				time,
			);

			return (
				matchesSearch &&
				matchesIssueType &&
				matchesStatus &&
				matchesPriority &&
				matchesTime
			);
		});
	}, [tickets, search, issueType, status, priority, time]);

	const syncSelectedTicket = (nextTickets: SupportTicket[]) => {
		setSelectedTicket((prev: SupportTicket | null) => {
			if (!prev) return null;
			return nextTickets.find((ticket) => ticket.id === prev.id) ?? null;
		});
	};

	const updateTicketById = (
		ticketId: string,
		updater: (ticket: SupportTicket) => SupportTicket,
	) => {
		setTickets((prev: SupportTicket[]) => {
			const next = prev.map((ticket) =>
				ticket.id === ticketId ? updater(ticket) : ticket,
			);

			syncSelectedTicket(next);
			return next;
		});
	};

	const appendConversationItem = (
		ticketId: string,
		item: SupportConversationItem,
		nextStatus?: SupportTicketStatus,
	) => {
		updateTicketById(ticketId, (ticket) => ({
			...ticket,
			status: nextStatus ?? ticket.status,
			updatedAt: item.createdAt,
			conversation: [...ticket.conversation, item],
		}));
	};

	const handleViewTicket = (ticket: SupportTicket) => {
		setSelectedTicket(ticket);
	};

	const handleUpdateStatus = (
		ticketId: string,
		nextStatus: SupportTicketStatus,
	) => {
		updateTicketById(ticketId, (ticket) => ({
			...ticket,
			status: nextStatus,
			updatedAt: new Date().toISOString(),
		}));
	};

	const handleUpdatePriority = (
		ticketId: string,
		nextPriority: SupportTicketPriority,
	) => {
		updateTicketById(ticketId, (ticket) => ({
			...ticket,
			priority: nextPriority,
			updatedAt: new Date().toISOString(),
		}));
	};

	const handleUpdateAssignee = (
		ticketId: string,
		assigneeName: string | null,
	) => {
		updateTicketById(ticketId, (ticket) => ({
			...ticket,
			assigneeName,
			updatedAt: new Date().toISOString(),
		}));
	};

	const handleAddReply = (ticketId: string, message: string) => {
		const now = new Date().toISOString();

		appendConversationItem(
			ticketId,
			{
				id: `msg_${Date.now()}`,
				senderName: "Super Admin Support",
				senderType: "SUPPORT",
				message,
				createdAt: now,
			},
			"IN_PROGRESS",
		);
	};

	const handleSendEmail = (ticketId: string) => {
		const now = new Date().toISOString();

		appendConversationItem(ticketId, {
			id: `msg_${Date.now()}`,
			senderName: "System",
			senderType: "SYSTEM",
			message: "Đã gửi email hỗ trợ tới khách hàng từ hệ thống support.",
			createdAt: now,
		});
	};

	const handleImpersonate = (ticketId: string) => {
		const now = new Date().toISOString();

		appendConversationItem(ticketId, {
			id: `msg_${Date.now()}`,
			senderName: "System",
			senderType: "SYSTEM",
			message:
				"Đã bắt đầu phiên giả lập vào workspace để kiểm tra lỗi. Hành động này cần được audit log.",
			createdAt: now,
		});
	};

	const handleResetFilters = () => {
		setSearch("");
		setIssueType("all");
		setStatus("all");
		setPriority("all");
		setTime("all");
	};

	return (
		<div className='space-y-6 p-6'>
			<SupportAdminHeader />

			<SupportOverviewCards tickets={tickets} />

			<SupportFilterBar
				search={search}
				issueType={issueType}
				status={status}
				priority={priority}
				time={time}
				onSearchChange={setSearch}
				onIssueTypeChange={setIssueType}
				onStatusChange={setStatus}
				onPriorityChange={setPriority}
				onTimeChange={setTime}
				onReset={handleResetFilters}
			/>

			<SupportTicketManagementTable
				tickets={filteredTickets}
				onView={handleViewTicket}
				onSendEmail={handleSendEmail}
				onImpersonate={handleImpersonate}
			/>

			<SupportTicketDetailPanel
				key={selectedTicket?.id ?? "support-ticket-detail"}
				ticket={selectedTicket}
				supportAgents={SUPPORT_AGENTS}
				onClose={() => setSelectedTicket(null)}
				onUpdateStatus={handleUpdateStatus}
				onUpdatePriority={handleUpdatePriority}
				onUpdateAssignee={handleUpdateAssignee}
				onAddReply={handleAddReply}
				onSendEmail={handleSendEmail}
				onImpersonate={handleImpersonate}
			/>
		</div>
	);
}
