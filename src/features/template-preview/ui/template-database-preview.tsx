"use client";

import type {
	TemplateBlock,
	TemplateDatabaseProperty,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import {
	Calendar,
	Check,
	CheckSquare,
	CircleDot,
	Database,
	FileText,
	Hash,
	Link as LinkIcon,
	Mail,
	Phone,
	Table as TableIcon,
	Type,
	User,
} from "lucide-react";
import React from "react";

interface TemplateDatabasePreviewProps {
	block: TemplateBlock;
	databases: TemplateDatabaseSnapshot[];
}

interface ColumnDef {
	id: string;
	name: string;
	type: string;
	property: TemplateDatabaseProperty;
}

interface ResolvedRow {
	id: string;
	valuesByPropertyId: Map<string, unknown>;
}

const OPTION_COLOR_MAP: Record<string, string> = {
	blue: "bg-blue-500/10 text-blue-500 border-blue-500/30",
	green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
	emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
	red: "bg-rose-500/10 text-rose-500 border-rose-500/30",
	rose: "bg-rose-500/10 text-rose-500 border-rose-500/30",
	yellow: "bg-amber-500/10 text-amber-500 border-amber-500/30",
	amber: "bg-amber-500/10 text-amber-500 border-amber-500/30",
	purple: "bg-purple-500/10 text-purple-500 border-purple-500/30",
	pink: "bg-pink-500/10 text-pink-500 border-pink-500/30",
	orange: "bg-orange-500/10 text-orange-500 border-orange-500/30",
	gray: "bg-muted text-muted-foreground border-border/60",
	default: "bg-muted text-muted-foreground border-border/60",
};

function formatDate(dateStr: string): string {
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	} catch {
		return dateStr;
	}
}

function renderColumnIcon(type: string) {
	const normType = (type || "").toUpperCase();
	switch (normType) {
		case "STATUS":
			return <CircleDot className='size-3 text-emerald-500' />;
		case "SELECT":
		case "MULTI_SELECT":
			return <Hash className='size-3 text-amber-500' />;
		case "DATE":
		case "CREATED_TIME":
		case "UPDATED_TIME":
			return <Calendar className='size-3 text-blue-500' />;
		case "PERSON":
		case "CREATED_BY":
			return <User className='size-3 text-purple-500' />;
		case "CHECKBOX":
			return <CheckSquare className='size-3 text-emerald-500' />;
		case "NUMBER":
			return <Hash className='size-3 text-cyan-500' />;
		case "URL":
			return <LinkIcon className='size-3 text-sky-500' />;
		case "EMAIL":
			return <Mail className='size-3 text-indigo-500' />;
		case "PHONE":
			return <Phone className='size-3 text-teal-500' />;
		case "FILE":
			return <FileText className='size-3 text-orange-500' />;
		case "TITLE":
		case "TEXT":
		default:
			return <Type className='size-3 text-muted-foreground' />;
	}
}

function renderCellValue(
	value: unknown,
	type: string,
	property: TemplateDatabaseProperty,
) {
	if (value === null || value === undefined || value === "") {
		return <span className='text-muted-foreground/40 italic'>Empty</span>;
	}

	const normType = (type || "").toUpperCase();

	switch (normType) {
		case "STATUS":
		case "SELECT": {
			const optionId = typeof value === "string" ? value : String(value);
			const option = property.options?.find((opt) => opt.id === optionId);
			if (!option) {
				return (
					<span className='text-muted-foreground/40 italic'>Empty</span>
				);
			}
			const colorClass =
				option.color && OPTION_COLOR_MAP[option.color.toLowerCase()]
					? OPTION_COLOR_MAP[option.color.toLowerCase()]
					: "bg-muted text-muted-foreground border-border/60";

			return (
				<Badge
					variant='outline'
					className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}
				>
					{option.name}
				</Badge>
			);
		}

		case "MULTI_SELECT": {
			const optionIds = Array.isArray(value)
				? (value as string[])
				: typeof value === "string"
					? [value]
					: [];

			const matchedOptions = optionIds
				.map((optId) => property.options?.find((opt) => opt.id === optId))
				.filter(
					(opt): opt is NonNullable<typeof opt> => opt !== undefined,
				);

			if (matchedOptions.length === 0) {
				return (
					<span className='text-muted-foreground/40 italic'>Empty</span>
				);
			}

			return (
				<div className='flex flex-wrap items-center gap-1'>
					{matchedOptions.map((opt) => {
						const colorClass =
							opt.color && OPTION_COLOR_MAP[opt.color.toLowerCase()]
								? OPTION_COLOR_MAP[opt.color.toLowerCase()]
								: "bg-muted text-muted-foreground border-border/60";

						return (
							<Badge
								key={opt.id}
								variant='outline'
								className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}
							>
								{opt.name}
							</Badge>
						);
					})}
				</div>
			);
		}

		case "CHECKBOX": {
			const isChecked = value === true || value === "true";
			return (
				<div
					className={`flex size-4 items-center justify-center rounded-sm border ${
						isChecked
							? "border-primary bg-primary text-primary-foreground"
							: "border-muted-foreground/30 bg-muted/10"
					}`}
				>
					{isChecked && <Check className='size-3 stroke-[3]' />}
				</div>
			);
		}

		case "NUMBER": {
			if (typeof value === "number") {
				return (
					<span className='font-mono text-xs text-foreground/90'>
						{value.toLocaleString()}
					</span>
				);
			}
			const num = Number(value);
			if (!isNaN(num)) {
				return (
					<span className='font-mono text-xs text-foreground/90'>
						{num.toLocaleString()}
					</span>
				);
			}
			return (
				<span className='font-mono text-xs text-foreground/90'>
					{String(value)}
				</span>
			);
		}

		case "DATE": {
			if (value && typeof value === "object") {
				const dateObj = value as {
					start?: string;
					end?: string | null;
				};
				if (dateObj.start && dateObj.end) {
					return (
						<span className='text-xs text-foreground/90'>
							{formatDate(dateObj.start)} →{" "}
							{formatDate(dateObj.end)}
						</span>
					);
				}
				if (dateObj.start) {
					return (
						<span className='text-xs text-foreground/90'>
							{formatDate(dateObj.start)}
						</span>
					);
				}
			}
			if (typeof value === "string") {
				return (
					<span className='text-xs text-foreground/90'>
						{formatDate(value)}
					</span>
				);
			}
			return (
				<span className='text-muted-foreground/40 italic'>Empty</span>
			);
		}

		case "PERSON": {
			const ids = Array.isArray(value)
				? (value as string[])
				: [String(value)];

			return (
				<div className='flex flex-wrap items-center gap-1'>
					{ids.map((id) => (
						<Badge
							key={id}
							variant='secondary'
							className='gap-1 text-[10px] font-mono px-1.5 py-0 bg-muted/40 text-muted-foreground border border-border/50'
							title={id}
						>
							<User className='size-2.5' />
							<span>
								{id.length > 8 ? `${id.slice(0, 8)}...` : id}
							</span>
						</Badge>
					))}
				</div>
			);
		}

		case "FILE": {
			const fileIds = Array.isArray(value)
				? (value as string[])
				: [String(value)];

			return (
				<div className='flex flex-wrap items-center gap-1'>
					{fileIds.map((id) => (
						<Badge
							key={id}
							variant='outline'
							className='gap-1 text-[10px] font-mono px-1.5 py-0 bg-muted/20 text-muted-foreground border border-border/50'
							title={id}
						>
							<FileText className='size-2.5' />
							<span>
								{id.length > 8 ? `${id.slice(0, 8)}...` : id}
							</span>
						</Badge>
					))}
				</div>
			);
		}

		case "URL": {
			const urlStr = String(value);
			return (
				<a
					href={urlStr}
					target='_blank'
					rel='noopener noreferrer'
					className='text-xs text-primary underline underline-offset-2 hover:opacity-80 truncate max-w-[200px] inline-block'
				>
					{urlStr}
				</a>
			);
		}

		case "EMAIL": {
			const emailStr = String(value);
			return (
				<a
					href={`mailto:${emailStr}`}
					className='text-xs text-foreground/90 hover:underline truncate max-w-[200px] inline-block'
				>
					{emailStr}
				</a>
			);
		}

		case "PHONE": {
			return (
				<span className='text-xs text-foreground/90 font-mono'>
					{String(value)}
				</span>
			);
		}

		case "CREATED_TIME":
		case "UPDATED_TIME": {
			if (typeof value === "string") {
				return (
					<span className='text-xs text-muted-foreground'>
						{formatDate(value)}
					</span>
				);
			}
			return (
				<span className='text-xs text-muted-foreground'>
					{String(value)}
				</span>
			);
		}

		case "CREATED_BY": {
			const userId = String(value);
			return (
				<Badge
					variant='secondary'
					className='gap-1 text-[10px] font-mono px-1.5 py-0 bg-muted/40 text-muted-foreground border border-border/50'
					title={userId}
				>
					<User className='size-2.5' />
					<span>
						{userId.length > 8 ? `${userId.slice(0, 8)}...` : userId}
					</span>
				</Badge>
			);
		}

		case "TITLE":
		case "TEXT":
		default: {
			if (typeof value === "string" || typeof value === "number") {
				return (
					<span className='text-xs text-foreground/90'>
						{String(value)}
					</span>
				);
			}
			return (
				<span className='text-xs text-foreground/90'>
					{JSON.stringify(value)}
				</span>
			);
		}
	}
}

export function TemplateDatabasePreview({
	block,
	databases,
}: TemplateDatabasePreviewProps) {
	const content = React.useMemo(() => {
		return (block.content || {}) as Record<string, unknown>;
	}, [block.content]);

	const dataConfig = React.useMemo(() => {
		return (block.data_config || {}) as Record<string, unknown>;
	}, [block.data_config]);

	const databaseId =
		typeof dataConfig.database_id === "string"
			? dataConfig.database_id
			: typeof content.database_id === "string"
				? content.database_id
				: null;

	const viewId =
		typeof dataConfig.view_id === "string"
			? dataConfig.view_id
			: typeof content.view_id === "string"
				? content.view_id
				: null;

	const database = React.useMemo(() => {
		if (!databaseId) return null;
		return databases.find((item) => item.id === databaseId) ?? null;
	}, [databases, databaseId]);

	const selectedView = React.useMemo(() => {
		if (!database) return null;
		if (viewId) {
			const found = database.views?.find((item) => item.id === viewId);
			if (found) return found;
		}
		return database.views?.[0] ?? null;
	}, [database, viewId]);

	const title =
		database?.name ||
		(content.title as string) ||
		(dataConfig.title as string) ||
		block.title ||
		"Database";

	const viewName =
		selectedView?.name ||
		(dataConfig.view_name as string) ||
		(content.view_name as string) ||
		"Table view";

	// Extract columns from real snapshot: selected view visible properties -> database properties
	const columns: ColumnDef[] = React.useMemo(() => {
		if (!database) return [];

		const propertyMap = new Map<string, TemplateDatabaseProperty>(
			(database.properties || []).map((p) => [p.id, p]),
		);

		if (
			selectedView &&
			Array.isArray(selectedView.properties) &&
			selectedView.properties.length > 0
		) {
			const visibleViewProps = [...selectedView.properties]
				.filter((vp) => vp.visible)
				.sort((a, b) =>
					(a.position || "").localeCompare(b.position || ""),
				);

			const resolvedCols = visibleViewProps
				.map((vp) => propertyMap.get(vp.template_property_id))
				.filter((p): p is TemplateDatabaseProperty => p !== undefined)
				.map((property) => ({
					id: property.id,
					name: property.name,
					type: property.type,
					property,
				}));

			if (resolvedCols.length > 0) {
				return resolvedCols;
			}
		}

		// Fallback to database properties sorted by position if no view properties
		return [...(database.properties || [])]
			.sort((a, b) => (a.position || "").localeCompare(b.position || ""))
			.map((property) => ({
				id: property.id,
				name: property.name,
				type: property.type,
				property,
			}));
	}, [database, selectedView]);

	// Extract rows from real snapshot
	const rows: ResolvedRow[] = React.useMemo(() => {
		if (!database || !Array.isArray(database.rows)) return [];

		return database.rows.map((row) => {
			const valuesMap = new Map<string, unknown>();
			if (Array.isArray(row.values)) {
				for (const val of row.values) {
					valuesMap.set(val.template_property_id, val.value);
				}
			}
			return {
				id: row.id,
				valuesByPropertyId: valuesMap,
			};
		});
	}, [database]);

	// Missing snapshot state
	if (!database) {
		return (
			<div className='w-full my-4 rounded-xl border border-border/70 bg-card/60 p-6 text-center shadow-xs'>
				<div className='flex size-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mx-auto mb-2.5'>
					<Database className='size-5 text-muted-foreground/60' />
				</div>
				<h4 className='text-xs font-semibold text-foreground'>
					Database snapshot unavailable
				</h4>
				<p className='text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto'>
					This template version does not have snapshot data for this
					database.
				</p>
			</div>
		);
	}

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
								{viewName} · {rows.length}{" "}
								{rows.length === 1 ? "row" : "rows"}
							</span>
						</div>
					</div>
				</div>

				<Badge
					variant='secondary'
					className='text-[10px] bg-background/80 text-muted-foreground border border-border/60 font-normal px-2'
				>
					Read-only snapshot
				</Badge>
			</div>

			{/* Read-only Table Content */}
			{columns.length === 0 ? (
				<div className='py-12 text-center text-xs text-muted-foreground'>
					No visible properties in this view
				</div>
			) : (
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
							{rows.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className='h-16 text-center text-xs text-muted-foreground/60 italic'
									>
										No rows in this database snapshot
									</td>
								</tr>
							) : (
								rows.map((row) => (
									<tr
										key={row.id}
										className='transition-colors hover:bg-muted/15'
									>
										{columns.map((col) => (
											<td
												key={col.id}
												className='h-9 px-3 py-1.5 whitespace-nowrap text-xs'
											>
												{renderCellValue(
													row.valuesByPropertyId.get(
														col.id,
													),
													col.type,
													col.property,
												)}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}

			{/* Read-only Footer Note */}
			<div className='px-4 py-2 bg-muted/10 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground'>
				<span>
					Showing {rows.length} {rows.length === 1 ? "row" : "rows"}{" "}
					snapshot
				</span>
				<span className='italic'>Snapshot view • Editing disabled</span>
			</div>
		</div>
	);
}
