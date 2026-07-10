"use client";

import { UserFilterBar } from "@/components/admin/filters/user-filter-bar";

type Props = {
	search: string;
	status: string;
	createdAt?: Date;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onCreatedAtChange: (value: Date | undefined) => void;
	onReset: () => void;
};

export function SystemAdminFilterBar({
	search,
	status,
	createdAt,
	onSearchChange,
	onStatusChange,
	onCreatedAtChange,
	onReset,
}: Props) {
	return (
		<UserFilterBar
			search={search}
			status={status}
			role='all'
			createdAt={createdAt}
			onSearchChange={onSearchChange}
			onStatusChange={onStatusChange}
			onRoleChange={() => undefined}
			onCreatedAtChange={onCreatedAtChange}
			onReset={onReset}
			showRoleFilter={false}
		/>
	);
}
