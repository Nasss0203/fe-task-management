"use client";

import {
	DatabaseHeaderCell,
	DatabaseTableSurface,
	DatabaseValueCell,
} from "@/entities/database/ui/database-visuals";

import { Plus } from "lucide-react";

import { useCreateDatabaseRow } from "@/entities/database/model/database.mutations";

import type {
	Database,
	DatabaseRow,
	DatabaseViewDetail,
} from "@/entities/database/model/database.types";

import { InteractionMode } from "@/shared/model/interaction-mode";
import { AddPropertyPopover } from "./add-property-popover";
import { DatabaseCell } from "./database-cell";
import { DatabasePropertyHeader } from "./database-property-header";

type DatabaseValueChangeInput = {
	databaseId: string;
	rowId: string;
	propertyId: string;
	value: unknown;
};

interface TableViewProps {
	database: Database;
	viewId: string;
	viewDetail: DatabaseViewDetail;
	rows: DatabaseRow[];

	mode?: InteractionMode;

	onDatabaseValueChange?: (input: DatabaseValueChangeInput) => void;
}

export function TableView({
	database,
	viewId,
	viewDetail,
	rows,
	mode = "editable",
	onDatabaseValueChange,
}: TableViewProps) {
	const editable = mode === "editable";
	const createRowMutation = useCreateDatabaseRow(database.id);

	const viewPropertiesByPropertyId = new Map(
		viewDetail.properties.map((viewProperty) => [
			viewProperty.propertyId,
			viewProperty,
		]),
	);

	const visibleProperties = [...database.properties]
		.filter((property) => {
			// Property bắt buộc như Name luôn phải hiện
			if (!property.isHideable) {
				return true;
			}

			const viewProperty = viewPropertiesByPropertyId.get(property.id);

			return viewProperty?.visible ?? false;
		})
		.sort((a, b) => {
			const aViewProperty = viewPropertiesByPropertyId.get(a.id);

			const bViewProperty = viewPropertiesByPropertyId.get(b.id);

			return (
				Number(aViewProperty?.position ?? a.position) -
				Number(bViewProperty?.position ?? b.position)
			);
		});
	return (
		<div className='w-full min-w-0 max-w-full'>
			{/* Chỉ table được scroll ngang */}
			<DatabaseTableSurface>
				<thead>
					<tr className='border-b'>
						{visibleProperties.map((property) => (
							<DatabaseHeaderCell key={property.id}>
								<DatabasePropertyHeader
									databaseId={database.id}
									viewId={viewId}
									property={property}
									mode={mode}
								/>
							</DatabaseHeaderCell>
						))}

						<th className='w-10 min-w-10 px-1'>
							{editable && (
								<th className='w-10 min-w-10 px-1'>
									<AddPropertyPopover
										databaseId={database.id}
									/>
								</th>
							)}
						</th>
					</tr>
				</thead>

				<tbody>
					{rows.map((row) => {
						const valueMap = new Map<string, unknown>(
							row.values.map((item) => [
								item.propertyId,
								item.value,
							]),
						);

						return (
							<tr
								key={row.id}
								className='border-b last:border-b-0'
							>
								{visibleProperties.map((property) => {
									const value = valueMap.get(property.id);

									return (
										<DatabaseValueCell key={property.id}>
											<DatabaseCell
												databaseId={database.id}
												rowId={row.id}
												property={property}
												value={value}
												mode={mode}
												onValueChange={
													mode === "preview"
														? onDatabaseValueChange
														: undefined
												}
											/>
										</DatabaseValueCell>
									);
								})}

								{editable && <td className='w-10 min-w-10' />}
							</tr>
						);
					})}

					{rows.length === 0 && (
						<tr>
							<td
								colSpan={Math.max(
									visibleProperties.length + 1,
									1,
								)}
								className='h-20 text-center text-muted-foreground'
							>
								No rows
							</td>
						</tr>
					)}
				</tbody>
			</DatabaseTableSurface>
			{editable && (
				<button
					type='button'
					disabled={createRowMutation.isPending}
					onClick={() => createRowMutation.mutate()}
					className='flex h-9 w-full items-center gap-2 px-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50'
				>
					<Plus className='size-4' />

					{createRowMutation.isPending ? "Adding..." : "New row"}
				</button>
			)}
		</div>
	);
}
