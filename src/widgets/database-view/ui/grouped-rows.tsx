"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { PropertyOptionBadge } from "@/entities/database/ui/database-visuals";

import { groupRows, NO_GROUP_ID } from "../lib/group-rows";

export function GroupedRows({
	property,
	rows,
	children,
}: {
	property: DatabaseProperty;
	rows: DatabaseRow[];
	children: (rows: DatabaseRow[]) => ReactNode;
}) {
	const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
	const groups = groupRows(rows, property);

	const toggle = (id: string) =>
		setCollapsed((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className='space-y-4'>
			{groups.map((group) => {
				const isCollapsed = collapsed.has(group.id);

				return (
					<section key={group.id} aria-label={group.name}>
						<button
							type='button'
							onClick={() => toggle(group.id)}
							aria-expanded={!isCollapsed}
							className='mb-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm hover:bg-muted/60'
						>
							{isCollapsed ? (
								<ChevronRight className='size-3.5 text-muted-foreground' />
							) : (
								<ChevronDown className='size-3.5 text-muted-foreground' />
							)}
							{property.type === PropertyType.CHECKBOX ||
							group.id === NO_GROUP_ID ? (
								<span className='font-medium'>
									{group.name}
								</span>
							) : (
								<PropertyOptionBadge
									name={group.name}
									color={group.color}
								/>
							)}
							<span className='text-xs text-muted-foreground'>
								{group.rows.length}
							</span>
						</button>
						{!isCollapsed && children(group.rows)}
					</section>
				);
			})}
		</div>
	);
}
