import type { AdminUser } from "./users.types";

export const adminUsers: AdminUser[] = [
	{
		id: "u_1",
		fullName: "Nguyen Anh Nam",
		email: "nam@example.com",
		status: "ACTIVE",
		systemRole: "SYSTEM_ADMIN",
		createdAt: "2026-04-12T08:00:00.000Z",
		lastActive: "2026-04-18T08:30:00.000Z",
		workspaces: [
			{ id: "w_1", name: "Acme Inc.", role: "OWNER" },
			{ id: "w_2", name: "Moon Labs", role: "ADMIN" },
		],
		activities: [
			{
				id: "a_1",
				action: "Assigned system admin permission",
				time: "2026-04-18T08:20:00.000Z",
			},
			{
				id: "a_2",
				action: "Created workspace Acme Inc.",
				time: "2026-04-16T10:10:00.000Z",
			},
			{
				id: "a_3",
				action: "Viewed audit logs",
				time: "2026-04-15T14:30:00.000Z",
			},
		],
	},
	{
		id: "u_2",
		fullName: "Tran Minh Khoa",
		email: "khoa@example.com",
		status: "ACTIVE",
		systemRole: "USER",
		createdAt: "2026-04-10T09:20:00.000Z",
		lastActive: "2026-04-17T16:15:00.000Z",
		workspaces: [{ id: "w_3", name: "Nova Team", role: "ADMIN" }],
		activities: [
			{
				id: "a_4",
				action: "Upgraded workspace to Pro plan",
				time: "2026-04-17T15:00:00.000Z",
			},
			{
				id: "a_5",
				action: "Added 3 members to workspace",
				time: "2026-04-16T11:00:00.000Z",
			},
		],
	},
	{
		id: "u_3",
		fullName: "Le Thi Huong",
		email: "huong@example.com",
		status: "LOCKED",
		systemRole: "USER",
		createdAt: "2026-04-05T07:40:00.000Z",
		lastActive: "2026-04-14T19:10:00.000Z",
		workspaces: [
			{ id: "w_4", name: "Pixel Studio", role: "MEMBER" },
			{ id: "w_5", name: "Design Hub", role: "ADMIN" },
		],
		activities: [
			{
				id: "a_6",
				action: "Account locked by system admin",
				time: "2026-04-15T09:00:00.000Z",
			},
			{
				id: "a_7",
				action: "Failed login attempts detected",
				time: "2026-04-15T08:45:00.000Z",
			},
		],
	},
	{
		id: "u_4",
		fullName: "Pham Gia Bao",
		email: "bao@example.com",
		status: "PENDING",
		systemRole: "USER",
		createdAt: "2026-04-17T06:00:00.000Z",
		lastActive: "2026-04-17T06:05:00.000Z",
		workspaces: [{ id: "w_6", name: "Start Fast", role: "MEMBER" }],
		activities: [
			{
				id: "a_8",
				action: "Accepted workspace invite",
				time: "2026-04-17T06:05:00.000Z",
			},
		],
	},
	{
		id: "u_5",
		fullName: "Vo Thanh Dat",
		email: "dat@example.com",
		status: "ACTIVE",
		systemRole: "USER",
		createdAt: "2026-03-28T10:00:00.000Z",
		lastActive: "2026-04-18T07:15:00.000Z",
		workspaces: [
			{ id: "w_7", name: "Task Core", role: "OWNER" },
			{ id: "w_8", name: "Ops Center", role: "MEMBER" },
			{ id: "w_9", name: "Growth Lab", role: "ADMIN" },
		],
		activities: [
			{
				id: "a_9",
				action: "Created 12 tasks in Task Core",
				time: "2026-04-18T07:00:00.000Z",
			},
			{
				id: "a_10",
				action: "Changed workspace role of a member",
				time: "2026-04-17T13:00:00.000Z",
			},
		],
	},
	{
		id: "u_6",
		fullName: "Bui Hoang Yen",
		email: "yen@example.com",
		status: "ACTIVE",
		systemRole: "SYSTEM_ADMIN",
		createdAt: "2026-03-20T12:30:00.000Z",
		lastActive: "2026-04-18T09:10:00.000Z",
		workspaces: [{ id: "w_10", name: "Support Desk", role: "OWNER" }],
		activities: [
			{
				id: "a_11",
				action: "Reset account status for user huong@example.com",
				time: "2026-04-18T08:50:00.000Z",
			},
			{
				id: "a_12",
				action: "Reviewed billing alerts",
				time: "2026-04-18T08:10:00.000Z",
			},
		],
	},
];
