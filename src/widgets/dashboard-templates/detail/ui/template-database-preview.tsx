"use client";

import React from "react";
import {
	Calendar,
	CircleDot,
	Database,
	Hash,
	Table as TableIcon,
	Type,
	User,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import type { TemplateBlock } from "@/entities/template";

interface TemplateDatabasePreviewProps {
	block: TemplateBlock;
}

interface ColumnDef {
	id: string;
	name: string;
	type: "text" | "status" | "select" | "date" | "number" | "person";
}

interface RowDef {
	id: string;
	cells: Record<string, string>;
}

export function TemplateDatabasePreview({ block }: TemplateDatabasePreviewProps) {
	// Parse snapshot configuration from block content or data_config
	// Note: We deliberately DO NOT call live database APIs with template database IDs.
	const content = React.useMemo(() => {
		return (block.content || {}) as Record<string, unknown>;
	}, [block.content]);

	const dataConfig = React.useMemo(() => {
		return (block.data_config || {}) as Record<string, unknown>;
	}, [block.data_config]);

	const title =
		(content.title as string) ||
		(dataConfig.title as string) ||
		block.title ||
		(content.name as string) ||
		(dataConfig.name as string) ||
		"Database View";

	const viewName =
		(dataConfig.view_name as string) ||
		(content.view_name as string) ||
		"Table View";

	// Extract columns if present in snapshot data, or use realistic default schema
	const columns: ColumnDef[] = React.useMemo(() => {
		const rawProps =
			(dataConfig.properties as unknown[]) ||
			(content.properties as unknown[]) ||
			(dataConfig.columns as unknown[]);

		if (Array.isArray(rawProps) && rawProps.length > 0) {
			return rawProps.map((p, idx) => {
				if (typeof p === "string") {
					return { id: `col-${idx}`, name: p, type: "text" };
				}
				if (p && typeof p === "object") {
					const obj = p as Record<string, unknown>;
					return {
						id: (obj.id as string) || `col-${idx}`,
						name: (obj.name as string) || `Column ${idx + 1}`,
						type: ((obj.type as string) || "text").toLowerCase() as ColumnDef["type"],
					};
				}
				return { id: `col-${idx}`, name: `Column ${idx + 1}`, type: "text" };
			});
		}

		// Curated default columns representing a task / team wiki database snapshot
		return [
			{ id: "col-name", name: "Name", type: "text" },
			{ id: "col-status", name: "Status", type: "status" },
			{ id: "col-priority", name: "Priority", type: "select" },
			{ id: "col-owner", name: "Assignee", type: "person" },
			{ id: "col-due", name: "Due Date", type: "date" },
		];
	}, [content, dataConfig]);

	// Extract rows if present in snapshot data, or use realistic sample rows
	const rows: RowDef[] = React.useMemo(() => {
		const rawRows =
			(dataConfig.rows as unknown[]) ||
			(content.rows as unknown[]) ||
			(dataConfig.records as unknown[]);

		if (Array.isArray(rawRows) && rawRows.length > 0) {
			return rawRows.map((r, idx) => {
				if (r && typeof r === "object") {
					const rowObj = r as Record<string, unknown>;
					const cells: Record<string, string> = {};
					for (const col of columns) {
						const val = rowObj[col.id] ?? rowObj[col.name];
						cells[col.id] = val !== undefined ? String(val) : "";
					}
					return {
						id: (rowObj.id as string) || `row-${idx}`,
						cells,
					};
				}
				return { id: `row-${idx}`, cells: {} };
			});
		}

		// Sample read-only snapshot records
		return [
			{
				id: "row-1",
				cells: {
					"col-name": "Team Onboarding Guide",
					"col-status": "Done",
					"col-priority": "High",
					"col-owner": "Alex Rivera",
					"col-due": "Oct 12, 2026",
				},
			},
			{
				id: "row-2",
				cells: {
					"col-name": "Technical Architecture Spec",
					"col-status": "In Progress",
					"col-priority": "High",
					"col-owner": "Nam",
					"col-due": "Oct 18, 2026",
				},
			},
			{
				id: "row-3",
				cells: {
					"col-name": "Product Documentation Review",
					"col-status": "Todo",
					"col-priority": "Medium",
					"col-owner": "Sara Chen",
					"col-due": "Oct 25, 2026",
				},
			},
		];
	}, [columns, content, dataConfig]);

	const renderColumnIcon = (type: ColumnDef["type"]) => {
		switch (type) {
			case "status":
				return <CircleDot className='size-3 text-emerald-500' />;
			case "select":
				return <Hash className='size-3 text-amber-500' />;
			case "date":
				return <Calendar className='size-3 text-blue-500' />;
			case "person":
				return <User className='size-3 text-purple-500' />;
			default:
				return <Type className='size-3 text-muted-foreground' />;
		}
	};

	const renderCellValue = (value: string, type: ColumnDef["type"]) => {
		if (!value) {
			return <span className='text-muted-foreground/40 italic'>Empty</span>;
		}

		if (type === "status") {
			const isDone = value.toLowerCase() === "done";
			const isInProgress =
				value.toLowerCase().includes("progress") ||
				value.toLowerCase() === "doing";

			return (
				<Badge
					variant='outline'
					className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
						isDone
							? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
							: isInProgress
								? "bg-blue-500/10 text-blue-500 border-blue-500/30"
								: "bg-muted text-muted-foreground border-border/60"
					}`}
				>
					{value}
				</Badge>
			);
		}

		if (type === "select") {
			const isHigh = value.toLowerCase() === "high";
			return (
				<Badge
					variant='secondary'
					className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
						isHigh
							? "bg-rose-500/10 text-rose-500 border-rose-500/30"
							: "bg-muted text-muted-foreground border-border/60"
					}`}
				>
					{value}
				</Badge>
			);
		}

		if (type === "person") {
			return (
				<div className='flex items-center gap-1.5'>
					<div className='size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold'>
						{value.charAt(0).toUpperCase()}
					</div>
					<span className='text-xs text-foreground/90'>{value}</span>
				</div>
			);
		}

		return <span className='text-xs text-foreground/90'>{value}</span>;
	};

	return (
		<div className='w-full my-4 rounded-xl border border-border/70 bg-card/60 overflow-hidden shadow-xs'>
			{/* Database Header */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20'>
				<div className='flex items-center gap-2.5'>
					<div className='flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary'>
						<Database className='size-3.5' />
					</div>
					<div>
						<h4 className='text-sm font-semibold text-foreground leading-tight'>
							{title}
						</h4>
						<div className='flex items-center gap-1.5 mt-0.5'>
							<TableIcon className='size-3 text-muted-foreground' />
							<span className='text-[11px] text-muted-foreground'>
								{viewName}
							</span>
						</div>
					</div>
				</div>

				<Badge
					variant='secondary'
					className='text-[10px] bg-background/80 text-muted-foreground border border-border/60 font-normal px-2'
				>
					Database Snapshot (Read-only)
				</Badge>
			</div>

			{/* Read-only Table */}
			<div className='overflow-x-auto'>
				<table className='w-full border-collapse text-left'>
					<thead>
						<tr className='border-b border-border/50 bg-muted/10'>
							{columns.map((col) => (
								<th
									key={col.id}
									className='h-8 px-3 text-[11px] font-medium text-muted-foreground'
								>
									<div className='flex items-center gap-1.5'>
										{renderColumnIcon(col.type)}
										<span>{col.name}</span>
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className='divide-y divide-border/40'>
						{rows.map((row) => (
							<tr
								key={row.id}
								className='transition-colors hover:bg-muted/15'
							>
								{columns.map((col) => (
									<td
										key={col.id}
										className='h-9 px-3 py-1.5 whitespace-nowrap text-xs'
									>
										{renderCellValue(row.cells[col.id] || "", col.type)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Read-only Footer Note */}
			<div className='px-4 py-2 bg-muted/10 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
				<span>Showing {rows.length} rows snapshot</span>
				<span className='italic'>Snapshot view • Editing disabled</span>
			</div>
		</div>
	);
}
