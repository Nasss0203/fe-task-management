"use client";

import { UserDetailPanel } from "@/components/admin/detail/user-detail-panel";
import { UserFilterBar } from "@/components/admin/filters/user-filter-bar";
import { UserAdminHeader } from "@/components/admin/header/user-admin-header";
import { UsersOverview } from "@/components/admin/overview/user-overview-cards";
import { adminUsers } from "@/components/admin/shared/users.mock-data";
import type { AdminUser } from "@/components/admin/shared/users.types";
import { matchesCreatedFilter } from "@/components/admin/shared/users.utils";
import { UserTable } from "@/components/admin/table/user-table";
import { useMemo, useState } from "react";

export default function AdminUsersPage() {
	const [users, setUsers] = useState<AdminUser[]>(adminUsers);
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [role, setRole] = useState("all");
	const [createdAt, setCreatedAt] = useState("all");

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				user.fullName.toLowerCase().includes(keyword) ||
				user.email.toLowerCase().includes(keyword);

			const matchesStatus = status === "all" || user.status === status;
			const matchesRole = role === "all" || user.systemRole === role;
			const matchesDate = matchesCreatedFilter(user.createdAt, createdAt);

			return matchesSearch && matchesStatus && matchesRole && matchesDate;
		});
	}, [users, search, status, role, createdAt]);

	const syncSelectedUser = (nextUsers: AdminUser[]) => {
		setSelectedUser((prev) => {
			if (!prev) return null;
			return nextUsers.find((user) => user.id === prev.id) ?? null;
		});
	};

	const updateUserById = (
		userId: string,
		updater: (user: AdminUser) => AdminUser,
	) => {
		setUsers((prev) => {
			const next = prev.map((user) =>
				user.id === userId ? updater(user) : user,
			);

			syncSelectedUser(next);
			return next;
		});
	};

	const handleViewUser = (user: AdminUser) => {
		setSelectedUser(user);
	};

	const handleToggleLock = (userId: string) => {
		updateUserById(userId, (user) => ({
			...user,
			status: user.status === "LOCKED" ? "ACTIVE" : "LOCKED",
		}));
	};

	const handleToggleAdmin = (userId: string) => {
		updateUserById(userId, (user) => ({
			...user,
			systemRole:
				user.systemRole === "SYSTEM_ADMIN" ? "USER" : "SYSTEM_ADMIN",
		}));
	};

	const handleResetStatus = (userId: string) => {
		updateUserById(userId, (user) => ({
			...user,
			status: "ACTIVE",
		}));
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatus("all");
		setRole("all");
		setCreatedAt("all");
	};

	return (
		<div className='space-y-6 p-6'>
			<UserAdminHeader />

			<UsersOverview users={users} />

			<UserFilterBar
				search={search}
				status={status}
				role={role}
				createdAt={createdAt}
				onSearchChange={setSearch}
				onStatusChange={setStatus}
				onRoleChange={setRole}
				onCreatedAtChange={setCreatedAt}
				onReset={handleResetFilters}
			/>

			<UserTable
				users={filteredUsers}
				onView={handleViewUser}
				onToggleLock={handleToggleLock}
				onToggleAdmin={handleToggleAdmin}
				onResetStatus={handleResetStatus}
			/>

			<UserDetailPanel
				key={selectedUser?.id ?? "user-detail"}
				user={selectedUser}
				onClose={() => setSelectedUser(null)}
			/>
		</div>
	);
}
