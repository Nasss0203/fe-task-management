import type { SupportTicket } from "./support-admin.types";

export const adminSupportTickets: SupportTicket[] = [
	{
		id: "ticket_1",
		ticketNo: "SUP-1001",
		title: "Invite member gửi email thất bại",
		reporterName: "Tran Minh Khoa",
		reporterEmail: "khoa@example.com",
		workspaceId: "ws_2",
		workspaceName: "Nova Team",
		issueType: "INVITE_ISSUE",
		priority: "HIGH",
		status: "OPEN",
		assigneeName: null,
		createdAt: "2026-04-19T08:20:00.000Z",
		updatedAt: "2026-04-19T08:20:00.000Z",
		summary:
			"Workspace không gửi được email invite member. Người dùng báo đã thử nhiều lần nhưng không có mail nào được nhận.",
		tags: ["invite", "email", "workspace"],
		attachments: [
			{
				id: "att_1",
				fileName: "invite-error.png",
				fileSize: "412 KB",
			},
		],
		canImpersonate: true,
		conversation: [
			{
				id: "msg_1",
				senderName: "Tran Minh Khoa",
				senderType: "CUSTOMER",
				message:
					"Tôi mời 3 thành viên vào workspace Nova Team nhưng không ai nhận được email.",
				createdAt: "2026-04-19T08:20:00.000Z",
			},
		],
	},
	{
		id: "ticket_2",
		ticketNo: "SUP-1002",
		title: "Payment thành công nhưng plan chưa được nâng",
		reporterName: "Olivia Nguyen",
		reporterEmail: "olivia@example.com",
		workspaceId: "ws_6",
		workspaceName: "Growth Lab",
		issueType: "PAYMENT_ISSUE",
		priority: "URGENT",
		status: "IN_PROGRESS",
		assigneeName: "Bui Hoang Yen",
		createdAt: "2026-04-18T10:40:00.000Z",
		updatedAt: "2026-04-19T07:10:00.000Z",
		summary:
			"Khách hàng đã thanh toán upgrade lên Enterprise nhưng workspace vẫn đang bị giới hạn ở gói Pro.",
		tags: ["billing", "upgrade", "payment"],
		attachments: [
			{
				id: "att_2",
				fileName: "invoice-042018.pdf",
				fileSize: "220 KB",
			},
		],
		canImpersonate: true,
		conversation: [
			{
				id: "msg_2",
				senderName: "Olivia Nguyen",
				senderType: "CUSTOMER",
				message:
					"Chúng tôi đã thanh toán rồi nhưng storage limit vẫn chưa tăng.",
				createdAt: "2026-04-18T10:40:00.000Z",
			},
			{
				id: "msg_3",
				senderName: "Bui Hoang Yen",
				senderType: "SUPPORT",
				message:
					"Đã tiếp nhận ticket, đang kiểm tra subscription và webhook thanh toán.",
				createdAt: "2026-04-18T11:00:00.000Z",
			},
		],
	},
	{
		id: "ticket_3",
		ticketNo: "SUP-1003",
		title: "Board sync bị lệch dữ liệu giữa 2 thành viên",
		reporterName: "Jessica Lee",
		reporterEmail: "jessica@example.com",
		workspaceId: "ws_3",
		workspaceName: "Pixel Studio",
		issueType: "SYNC_ISSUE",
		priority: "HIGH",
		status: "WAITING_CUSTOMER",
		assigneeName: "Kai Sou",
		createdAt: "2026-04-17T14:10:00.000Z",
		updatedAt: "2026-04-18T16:25:00.000Z",
		summary:
			"Một số task trên board không đồng bộ trạng thái giữa owner và member. Khách hàng đã gửi ảnh chụp màn hình.",
		tags: ["sync", "board", "task"],
		attachments: [
			{
				id: "att_3",
				fileName: "board-sync-issue.png",
				fileSize: "534 KB",
			},
		],
		canImpersonate: true,
		conversation: [
			{
				id: "msg_4",
				senderName: "Jessica Lee",
				senderType: "CUSTOMER",
				message:
					"Tôi thấy task đã chuyển Done nhưng team member vẫn thấy In Progress.",
				createdAt: "2026-04-17T14:10:00.000Z",
			},
			{
				id: "msg_5",
				senderName: "Kai Sou",
				senderType: "SUPPORT",
				message:
					"Bạn giúp gửi thêm video hoặc mô tả thao tác trước khi lỗi xảy ra nhé.",
				createdAt: "2026-04-18T16:25:00.000Z",
			},
		],
	},
	{
		id: "ticket_4",
		ticketNo: "SUP-1004",
		title: "Không đăng nhập được bằng Google OAuth",
		reporterName: "Pham Gia Bao",
		reporterEmail: "bao@example.com",
		workspaceId: "ws_2",
		workspaceName: "Nova Team",
		issueType: "LOGIN_ISSUE",
		priority: "MEDIUM",
		status: "RESOLVED",
		assigneeName: "Nass",
		createdAt: "2026-04-16T09:15:00.000Z",
		updatedAt: "2026-04-16T13:00:00.000Z",
		summary:
			"Người dùng gặp lỗi redirect khi đăng nhập bằng Google trên trình duyệt Edge.",
		tags: ["oauth", "login", "google"],
		attachments: [],
		canImpersonate: false,
		conversation: [
			{
				id: "msg_6",
				senderName: "Pham Gia Bao",
				senderType: "CUSTOMER",
				message: "Login bằng Google bị redirect loop liên tục.",
				createdAt: "2026-04-16T09:15:00.000Z",
			},
			{
				id: "msg_7",
				senderName: "Nass",
				senderType: "SUPPORT",
				message:
					"Đã fix cấu hình callback URL, bạn thử lại giúp mình nhé.",
				createdAt: "2026-04-16T12:45:00.000Z",
			},
		],
	},
	{
		id: "ticket_5",
		ticketNo: "SUP-1005",
		title: "Bug khi tạo task có attachment lớn",
		reporterName: "David Brown",
		reporterEmail: "david@example.com",
		workspaceId: "ws_5",
		workspaceName: "Task Core",
		issueType: "BUG_REPORT",
		priority: "MEDIUM",
		status: "OPEN",
		assigneeName: null,
		createdAt: "2026-04-15T11:05:00.000Z",
		updatedAt: "2026-04-15T11:05:00.000Z",
		summary:
			"Khi tạo task mới và upload file đính kèm lớn hơn 20MB thì modal bị treo.",
		tags: ["bug", "task", "attachment"],
		attachments: [],
		canImpersonate: true,
		conversation: [
			{
				id: "msg_8",
				senderName: "David Brown",
				senderType: "CUSTOMER",
				message:
					"Modal create task bị đơ khi tôi upload file video khoảng 25MB.",
				createdAt: "2026-04-15T11:05:00.000Z",
			},
		],
	},
	{
		id: "ticket_6",
		ticketNo: "SUP-1006",
		title: "Yêu cầu hỗ trợ export dữ liệu workspace",
		reporterName: "Anna Vo",
		reporterEmail: "anna@example.com",
		workspaceId: "ws_4",
		workspaceName: "Moon Labs",
		issueType: "SUPPORT_TICKET",
		priority: "LOW",
		status: "CLOSED",
		assigneeName: "Bui Hoang Yen",
		createdAt: "2026-04-14T08:00:00.000Z",
		updatedAt: "2026-04-14T17:30:00.000Z",
		summary:
			"Khách hàng muốn được hướng dẫn cách export dữ liệu task và board ra file.",
		tags: ["export", "help", "workspace"],
		attachments: [],
		canImpersonate: false,
		conversation: [
			{
				id: "msg_9",
				senderName: "Anna Vo",
				senderType: "CUSTOMER",
				message: "Bên mình cần export dữ liệu để lưu trữ nội bộ.",
				createdAt: "2026-04-14T08:00:00.000Z",
			},
			{
				id: "msg_10",
				senderName: "Bui Hoang Yen",
				senderType: "SUPPORT",
				message:
					"Đã gửi hướng dẫn export CSV và xác nhận khách hàng đã thực hiện thành công.",
				createdAt: "2026-04-14T17:30:00.000Z",
			},
		],
	},
];
