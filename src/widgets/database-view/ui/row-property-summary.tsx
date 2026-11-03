"use client";

import { SquareCheck } from "lucide-react";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { formatDatabaseValue } from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";

import { isEmptyValue } from "../lib/view-properties";
import { DatabaseCell } from "./database-cell";

const PLAIN_TEXT_TYPES = new Set<PropertyType>([
	PropertyType.TEXT,
	PropertyType.NUMBER,
	PropertyType.URL,
	PropertyType.EMAIL,
	PropertyType.PHONE,
]);

interface RowPropertySummaryProps {
	databaseId: string;
	pageId: string;
	rowId: string;
	properties: DatabaseProperty[];
	values: Map<string, unknown>;
	/** "card" for board cards, "inline" for list rows. */
	layout: "card" | "inline";
}

/** Read-only, compact rendering of a row's non-empty property values. */
export function RowPropertySummary({
	databaseId,
	pageId,
	rowId,
	properties,
	values,
	layout,
}: RowPropertySummaryProps) {
	const filled = properties.filter(
		(property) =>
			property.type !== PropertyType.TITLE &&
			!isEmptyValue(values.get(property.id)),
	);

	if (filled.length === 0) return null;

	return (
		<div
			className={cn(
				"flex min-w-0 text-xs text-muted-foreground",
				layout === "card"
					? "flex-wrap items-center gap-x-2 gap-y-1.5"
					: "h-6 flex-wrap items-center justify-end gap-x-2.5 overflow-hidden whitespace-nowrap [&>*]:shrink-0 [&_.flex-wrap]:flex-nowrap",
			)}
		>
			{filled.map((property) => {
				const value = values.get(property.id);

				if (property.type === PropertyType.CHECKBOX) {
					return (
						<span
							key={property.id}
							className='inline-flex items-center gap-1'
						>
							<SquareCheck className='size-3.5' />
							{property.name}
						</span>
					);
				}

				if (PLAIN_TEXT_TYPES.has(property.type)) {
					return (
						<span
							key={property.id}
							title={property.name}
							className='max-w-full truncate text-foreground/80'
						>
							{formatDatabaseValue(value)}
						</span>
					);
				}

				return (
					<div
						key={property.id}
						title={property.name}
						className={cn(
						"max-w-full min-w-0 [&_span.px-1]:px-0",
						property.type === PropertyType.DATE ? "text-faint" : "text-foreground/80",
					)}
					>
						<DatabaseCell
							databaseId={databaseId}
							pageId={pageId}
							rowId={rowId}
							property={property}
							value={value}
							mode='readonly'
						/>
					</div>
				);
			})}
		</div>
	);
}
