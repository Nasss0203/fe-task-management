"use client";

import { AuditLogDetailPanel } from "@/components/admin/detail/audit-log-detail-panel";
import { AuditLogFilterBar } from "@/components/admin/filters/audit-log-filter-bar";
import { AuditLogAdminHeader } from "@/components/admin/header/audit-log-admin-header";
import { AuditLogOverviewCards } from "@/components/admin/overview/audit-log-overview-cards";
import { adminAuditLogs } from "@/components/admin/shared/audit-log-admin.mock-data";
import type { AdminAuditLog } from "@/components/admin/shared/audit-log-admin.types";
import { matchesAuditDateFilter } from "@/components/admin/shared/audit-log-admin.utils";
import { AuditLogManagementTable } from "@/components/admin/table/audit-log-management-table";
import { useMemo, useState } from "react";

export default function AdminAuditLogsPage() {
	const [logs] = useState<AdminAuditLog[]>(adminAuditLogs);
	const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

	const [search, setSearch] = useState("");
	const [action, setAction] = useState("all");
	const [target, setTarget] = useState("all");
	const [time, setTime] = useState("all");

	const filteredLogs = useMemo(() => {
		return logs.filter((log) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				log.actorName.toLowerCase().includes(keyword) ||
				log.actorEmail.toLowerCase().includes(keyword) ||
				log.targetName.toLowerCase().includes(keyword);

			const matchesAction = action === "all" || log.action === action;
			const matchesTarget = target === "all" || log.targetType === target;
			const matchesTime = matchesAuditDateFilter(log.createdAt, time);

			return (
				matchesSearch && matchesAction && matchesTarget && matchesTime
			);
		});
	}, [logs, search, action, target, time]);

	const handleResetFilters = () => {
		setSearch("");
		setAction("all");
		setTarget("all");
		setTime("all");
	};

	return (
		<div className='space-y-6 p-6'>
			<AuditLogAdminHeader />

			<AuditLogOverviewCards logs={logs} />

			<AuditLogFilterBar
				search={search}
				action={action}
				target={target}
				time={time}
				onSearchChange={setSearch}
				onActionChange={setAction}
				onTargetChange={setTarget}
				onTimeChange={setTime}
				onReset={handleResetFilters}
			/>

			<AuditLogManagementTable
				logs={filteredLogs}
				onView={setSelectedLog}
			/>

			<AuditLogDetailPanel
				key={selectedLog?.id ?? "audit-log-detail"}
				log={selectedLog}
				onClose={() => setSelectedLog(null)}
			/>
		</div>
	);
}
