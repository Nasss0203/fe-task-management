export type SupportIssueType =
	| "SUPPORT_TICKET"
	| "BUG_REPORT"
	| "PAYMENT_ISSUE"
	| "INVITE_ISSUE"
	| "SYNC_ISSUE"
	| "LOGIN_ISSUE";

export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type SupportTicketStatus =
	| "OPEN"
	| "IN_PROGRESS"
	| "WAITING_CUSTOMER"
	| "RESOLVED"
	| "CLOSED";

export type SupportMessageSenderType = "CUSTOMER" | "SUPPORT" | "SYSTEM";

export type SupportTicketAttachment = {
	id: string;
	fileName: string;
	fileSize: string;
};

export type SupportConversationItem = {
	id: string;
	senderName: string;
	senderType: SupportMessageSenderType;
	message: string;
	createdAt: string;
};

export type SupportTicket = {
	id: string;
	ticketNo: string;
	title: string;
	reporterName: string;
	reporterEmail: string;
	workspaceId: string;
	workspaceName: string;
	issueType: SupportIssueType;
	priority: SupportTicketPriority;
	status: SupportTicketStatus;
	assigneeName: string | null;
	createdAt: string;
	updatedAt: string;
	summary: string;
	tags: string[];
	attachments: SupportTicketAttachment[];
	conversation: SupportConversationItem[];
	canImpersonate: boolean;
};
