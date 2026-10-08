"use client";
import type { TemplatePreviewInteractions } from "../model/template-preview-interactions";

import type {
	TemplateBlock,
	TemplateDatabaseProperty,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import {
	DatabaseTableSurface,
	DatabaseHeaderCell,
	DatabaseValueCell,
	PropertyIcon,
	PropertyOptionBadge,
	formatDatabaseValue,
} from "@/entities/database/ui/database-visuals";
import { DatabaseValueControl } from "@/entities/database/ui/database-value-control";
import { canInteract } from "@/shared/model/interaction-mode";
import { Table2 } from "lucide-react";
import React from "react";

interface TemplateDatabasePreviewProps extends TemplatePreviewInteractions {
	block: TemplateBlock;
	databases: TemplateDatabaseSnapshot[];
}
interface ColumnDef {
	id: string;
	name: string;
	type: string;
	property: TemplateDatabaseProperty;
	width?: number | null;
}
interface ResolvedRow {
	id: string;
	valuesByPropertyId: Map<string, unknown>;
}
function comparePosition(a: string, b: string) {
	const left = Number(a),
		right = Number(b);
	return Number.isFinite(left) && Number.isFinite(right)
		? left - right
		: a.localeCompare(b);
}
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

function renderCellValue(value: unknown, property: TemplateDatabaseProperty) {
	const type = property.type.toUpperCase();
	if (value === null || value === undefined || value === "")
		return type === "TITLE" ? (
			<span className='text-muted-foreground'>Untitled</span>
		) : null;
	if (type === "SELECT" || type === "STATUS" || type === "MULTI_SELECT") {
		const ids = Array.isArray(value) ? value : [value];
		const options = property.options.filter((option) =>
			ids.includes(option.id),
		);
		return (
			<div className='flex flex-wrap items-center gap-1'>
				{options.map((option) => (
					<PropertyOptionBadge
						key={option.id}
						name={option.name}
						color={option.color}
					/>
				))}
			</div>
		);
	}
	if (type === "DATE") {
		if (typeof value === "string") return formatDate(value);
		if (
			typeof value === "object" &&
			"start" in value &&
			typeof value.start === "string"
		) {
			return (
				formatDate(value.start) +
				("end" in value && typeof value.end === "string" && value.end
					? " → " + formatDate(value.end)
					: "")
			);
		}
		return null;
	}
	if (
		type === "URL" &&
		typeof value === "string" &&
		/^https?:\/\//i.test(value)
	)
		return (
			<a
				href={value}
				target='_blank'
				rel='noopener noreferrer'
				className='text-primary underline underline-offset-2'
			>
				{value}
			</a>
		);
	if (type === "EMAIL" && typeof value === "string")
		return (
			<a href={`mailto:${value}`} className='hover:underline'>
				{value}
			</a>
		);
	return formatDatabaseValue(value);
}

export function TemplateDatabasePreview({
	block,
	databases,
	mode = "readonly",
	onDatabaseValueChange,
	onDatabaseViewChange,
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
				.sort((a, b) => comparePosition(a.position, b.position));

			const resolvedCols = visibleViewProps
				.map((vp) => {
					const property = propertyMap.get(vp.template_property_id);
					return property ? { property, width: vp.width } : undefined;
				})
				.filter(
					(
						p,
					): p is {
						property: TemplateDatabaseProperty;
						width: number | null;
					} => p !== undefined,
				)
				.map(({ property, width }) => ({
					width,
					id: property.id,
					name: property.name,
					type: property.type,
					property,
				}));

			return resolvedCols;
		}

		// Fallback to database properties sorted by position if no view properties
		return [...(database.properties || [])]
			.sort((a, b) => comparePosition(a.position, b.position))
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

	if (!database)
		return (
			<div className='text-sm text-muted-foreground'>
				Database unavailable
			</div>
		);
	return (
		<section className='w-full min-w-0 max-w-full py-2' aria-label={title}>
			<h2 className='mb-2 text-xl font-semibold'>{title}</h2>
			<div className='mb-2 flex items-center gap-1'>
				{canInteract(mode) && onDatabaseViewChange ? (
					database.views.map((view) => (
						<button
							key={view.id}
							type='button'
							disabled={view.type !== "TABLE"}
							title={
								view.type !== "TABLE"
									? "This view type is not supported in preview yet."
									: undefined
							}
							aria-pressed={view.id === selectedView?.id}
							onClick={() =>
								onDatabaseViewChange(block.id, view.id)
							}
							className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm disabled:opacity-50 ${view.id === selectedView?.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
						>
							<Table2 className='size-4' />
							<span>{view.name}</span>
						</button>
					))
				) : (
					<div className='flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-foreground'>
						<Table2 className='size-4' />
						<span>{viewName}</span>
					</div>
				)}
			</div>
			{columns.length === 0 ? (
				<div className='h-20 py-6 text-sm text-muted-foreground'>
					No visible properties in this view
				</div>
			) : (
				<DatabaseTableSurface>
					<thead>
						<tr className='border-b'>
							{columns.map((col) => (
								<DatabaseHeaderCell
									key={col.id}
									style={
										typeof col.width === "number" &&
										col.width > 0
											? {
													width: col.width,
													minWidth: col.width,
												}
											: undefined
									}
								>
									<div className='flex w-full items-center gap-2'>
										<PropertyIcon type={col.type} />
										<span className='min-w-0 flex-1 truncate'>
											{col.name}
										</span>
									</div>
								</DatabaseHeaderCell>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr
								key={row.id}
								className='border-b last:border-b-0 hover:bg-muted/50'
							>
								{columns.map((col) => (
									<DatabaseValueCell
										key={col.id}
										style={
											typeof col.width === "number" &&
											col.width > 0
												? {
														width: col.width,
														minWidth: col.width,
													}
												: undefined
										}
									>
										<div className='flex min-h-8 w-full items-center px-1'>
											{[
												"CHECKBOX",
												"SELECT",
												"STATUS",
												"MULTI_SELECT",
											].includes(
												col.type.toUpperCase(),
											) ? (
												<DatabaseValueControl
													type={col.type.toUpperCase()}
													name={col.name}
													value={row.valuesByPropertyId.get(
														col.id,
													)}
													options={
														col.property.options
													}
													mode={mode}
													onValueChange={
														onDatabaseValueChange
															? (value) =>
																	onDatabaseValueChange(
																		database.id,
																		row.id,
																		col.id,
																		value,
																	)
															: undefined
													}
												/>
											) : (
												renderCellValue(
													row.valuesByPropertyId.get(
														col.id,
													),
													col.property,
												)
											)}
										</div>
									</DatabaseValueCell>
								))}
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td
									colSpan={columns.length}
									className='h-20 text-center text-muted-foreground'
								>
									No rows
								</td>
							</tr>
						)}
					</tbody>
				</DatabaseTableSurface>
			)}
		</section>
	);
}
